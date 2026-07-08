/**
 * types.ts — Tipagem centralizada da navegação
 *
 * Convenção de nomes:
 *   • RootStackParamList → telas do Stack raiz
 *   • TabParamList       → abas do Bottom Tab Navigator
 *
 * Use os tipos de props exportados nas telas para ter autocompletar
 * e verificação de tipos no navigate() e route.params.
 */
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ── Tab Param List ────────────────────────────────────────────────
export type TabParamList = {
  Home: undefined;
  Favoritos: undefined;
  Perfil: undefined;
};

// ── Root Stack Param List ─────────────────────────────────────────
export type RootStackParamList = {
  Login: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
  GerenciarEventos: undefined;
  NovoServico: undefined;
  GerenciarServicos: undefined;
  Avaliacoes: undefined;
  Sobre: undefined;
};

// ── Declaração global para useNavigation() sem generics ───────────
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// ── Props tipados por tela ────────────────────────────────────────

// Stack screens
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type GerenciarEventosScreenProps = NativeStackScreenProps<RootStackParamList, 'GerenciarEventos'>;
export type NovoServicoScreenProps = NativeStackScreenProps<RootStackParamList, 'NovoServico'>;
export type GerenciarServicosScreenProps = NativeStackScreenProps<RootStackParamList, 'GerenciarServicos'>;
export type AvaliacoesScreenProps = NativeStackScreenProps<RootStackParamList, 'Avaliacoes'>;
export type SobreScreenProps = NativeStackScreenProps<RootStackParamList, 'Sobre'>;

// Tab screens (compostas com o Stack raiz para acessar navigate global)
export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type FavoritosScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Favoritos'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type DashboardScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Perfil'>,
  NativeStackScreenProps<RootStackParamList>
>;
