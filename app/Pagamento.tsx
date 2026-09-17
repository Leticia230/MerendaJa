// Este arquivo fica em app/ (pasta escaneada pelo expo-router para montar
// as rotas). Ele NÃO deve conter nenhum código de Stripe diretamente,
// porque o scanner de rotas do expo-router carrega esse arquivo em todas
// as plataformas, inclusive web, ignorando a resolução .native/.web do
// Metro nesse caso específico.
//
// Por isso a implementação real mora em components/PagamentoScreen,
// que É um import comum (não uma rota) — aí sim o Metro escolhe
// corretamente PagamentoScreen.native.tsx ou PagamentoScreen.web.tsx
// dependendo da plataforma, sem nunca carregar o pacote nativo no web.
// O TypeScript não aplica a resolução das variantes `.native`/`.web`, mas o
// Metro resolve esse import corretamente em cada plataforma.
// @ts-ignore -- módulo resolvido pelo Metro conforme a plataforma
export { default } from '../components/PagamentoScreen';