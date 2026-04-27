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

    // Tentar primeiro como Admin (comum em setups de automação/dashboard)
    try {
      console.log("Tentando login como Admin...");
      await pb.admins.authWithPassword(email, password);
      console.log("Login como Admin realizado com sucesso.");
      return true;
    } catch (adminError: any) {
      // Se não for admin, tenta como usuário da coleção 'users'
      console.log("Falha login Admin, tentando como Usuário...");
      try {
        await pb.collection('users').authWithPassword(email, password);
        console.log("Login como Usuário realizado com sucesso.");
        return true;
      } catch (userError: any) {
        console.error("Ambas tentativas de login falharam.");
        throw userError;
      }
    }
  } catch (error) {
    console.error("Erro na autenticação PocketBase:", error);
    return false;
  }
}

export { pb };
