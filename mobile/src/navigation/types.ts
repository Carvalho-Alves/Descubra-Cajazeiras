import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { AvaliacaoTipo } from '../services/avaliacaoService';

export type TabParamList = {
  Mapa: undefined;
  Servicos: undefined;
  Eventos: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
  GerenciarEventos: undefined;
  NovoServico: undefined;
  NovoEvento: undefined;
  GerenciarServicos: undefined;
  GerenciarServicosDetail: { servicoId: string };
  GerenciarEventosDetail: { eventoId: string };
  EditarServico: { servicoId: string };
  EditarEvento: { eventoId: string };
  Avaliacoes:
    | { tipo: AvaliacaoTipo; referenciaId: string; titulo?: string; }
    | undefined;
  AvaliacoesDestaque: undefined;
  PerfilDashboard: undefined;
  Sobre: undefined;
  Detalhes: { item: any };
  MinhasInformacoes: undefined;
  Notificacoes: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type GerenciarEventosScreenProps = NativeStackScreenProps<RootStackParamList, 'GerenciarEventos'>;
export type NovoServicoScreenProps = NativeStackScreenProps<RootStackParamList, 'NovoServico'>;
export type NovoEventoScreenProps = NativeStackScreenProps<RootStackParamList, 'NovoEvento'>;
export type GerenciarServicosScreenProps = NativeStackScreenProps<RootStackParamList, 'GerenciarServicos'>;
export type GerenciarServicosDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'GerenciarServicosDetail'>;
export type GerenciarEventosDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'GerenciarEventosDetail'>;
export type EditarServicoScreenProps = NativeStackScreenProps<RootStackParamList, 'EditarServico'>;
export type EditarEventoScreenProps = NativeStackScreenProps<RootStackParamList, 'EditarEvento'>;
export type AvaliacoesScreenProps = NativeStackScreenProps<RootStackParamList, 'Avaliacoes'>;
export type AvaliacoesDestaqueScreenProps = NativeStackScreenProps<RootStackParamList, 'AvaliacoesDestaque'>;
export type PerfilDashboardScreenProps = NativeStackScreenProps<RootStackParamList, 'PerfilDashboard'>;
export type SobreScreenProps = NativeStackScreenProps<RootStackParamList, 'Sobre'>;
export type MinhasInformacoesScreenProps = NativeStackScreenProps<RootStackParamList, 'MinhasInformacoes'>;
export type NotificacoesScreenProps = NativeStackScreenProps<RootStackParamList, 'Notificacoes'>;

export type HomeScreenProps = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'Mapa'>, NativeStackScreenProps<RootStackParamList>>;
export type MapaScreenProps = HomeScreenProps;
export type EventosTabScreenProps = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'Eventos'>, NativeStackScreenProps<RootStackParamList>>;
export type ServicosTabScreenProps = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'Servicos'>, NativeStackScreenProps<RootStackParamList>>;
export type DashboardScreenProps = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'Perfil'>, NativeStackScreenProps<RootStackParamList>>;
export type FavoritosScreenProps = EventosTabScreenProps;