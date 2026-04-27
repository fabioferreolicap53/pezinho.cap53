import PocketBase from 'pocketbase';

const url = import.meta.env.VITE_POCKETBASE_URL || '';
// Garantir protocolo e remover barra final
const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
const cleanUrl = normalizedUrl.replace(/\/$/, '');

const pb = new PocketBase(cleanUrl);

/**
 * Helper para garantir autenticação antes de chamadas à API
 */
export async function ensureAuth() {
  if (pb.authStore.isValid) return true;
  
  try {
    const email = import.meta.env.VITE_PB_LOGIN;
    const password = import.meta.env.VITE_PB_PASSWORD;
    
    if (!email || !password) {
      console.error("Credenciais de login não encontradas no .env");
      return false;
    }

    // Tentar primeiro como Admin usando o endpoint legado (PocketBase < 0.23)
    // O SDK 0.26+ usa _superusers por padrão, que não existe em versões antigas
    try {
      console.log("Tentando login como Admin (legacy)...");
      const authData = await pb.send('/api/admins/auth-with-password', {
        method: 'POST',
        body: { identity: email, password: password },
      });
      
      if (authData?.token && authData?.admin) {
        pb.authStore.save(authData.token, authData.admin);
        console.log("Login como Admin (legacy) realizado com sucesso.");
        return true;
      }
    } catch (adminError: any) {
      console.log("Falha login Admin legacy, tentando como Usuário ou Superuser...");
      
      // Fallback para o comportamento padrão do SDK (Superusers ou Users)
      try {
        // Tenta Superusers (PB >= 0.23)
        await pb.admins.authWithPassword(email, password);
        console.log("Login como Superuser realizado com sucesso.");
        return true;
      } catch (superError: any) {
        try {
          // Tenta Coleção Users (Auth collection padrão)
          await pb.collection('users').authWithPassword(email, password);
          console.log("Login como Usuário realizado com sucesso.");
          return true;
        } catch (userError: any) {
          console.error("Todas as tentativas de login falharam.");
          throw userError;
        }
      }
    }
    return false;
  } catch (error) {
    console.error("Erro na autenticação PocketBase:", error);
    return false;
  }
}

export { pb };
