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
      console.warn("Credenciais ausentes. Acessando dados públicos (somente leitura).");
      return true;
    }

    // Tentar primeiro como Admin usando o endpoint legado (PocketBase < 0.23)
    try {
      const authData = await pb.send('/api/admins/auth-with-password', {
        method: 'POST',
        body: { identity: email, password: password },
        requestKey: null,
      });

      if (authData?.token && authData?.admin) {
        pb.authStore.save(authData.token, authData.admin);
        return true;
      }
    } catch {
      // fallback abaixo
    }

    try {
      await pb.admins.authWithPassword(email, password, { requestKey: null });
      return true;
    } catch {
      // fallback abaixo
    }

    try {
      await pb.collection('users').authWithPassword(email, password, { requestKey: null });
      return true;
    } catch {
      // Nenhuma autenticação funcionou, mas coleções são públicas
      console.warn("Auth falhou. Acessando dados públicos (somente leitura). Edições podem falhar.");
      return true;
    }
  } catch (error) {
    console.warn("Erro na autenticação PocketBase. Continuando sem auth:", error);
    return true;
  }
}

export { pb };
