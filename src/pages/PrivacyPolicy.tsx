import { ChevronRight, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

const menuItems = [
  "Inicio",
  "Politica",
  "Economia",
  "Sociedade",
  "Desporto",
  "Cultura",
  "Investigacao",
  "Opiniao",
  "Mundo",
  "Tecnologia",
];

const sections = [
  {
    title: "1. Informacoes recolhidas",
    text: "O Jornal O Destaque pode recolher informacoes fornecidas pelo utilizador, dados de conta, preferencias de leitura, favoritos, notificacoes e dados tecnicos necessarios para o funcionamento do site e da aplicacao de noticias.",
  },
  {
    title: "2. Como usamos os dados",
    text: "As informacoes sao usadas para disponibilizar noticias locais de Mocambique, noticias do mundo, jornais digitais, conteudos editoriais, gestao de acessos, suporte ao leitor e notificacoes autorizadas.",
  },
  {
    title: "3. Conteudo jornalistico",
    text: "A aplicacao apresenta conteudo jornalistico publicado pelo O Destaque em categorias como Politica, Economia, Sociedade, Desporto, Cultura, Investigacao, Opiniao, Mundo, Tecnologia, Saude, Cinema, Literatura, Entretenimento e Documentario.",
  },
  {
    title: "4. Partilha de informacoes",
    text: "Nao vendemos dados pessoais. A partilha pode ocorrer apenas com prestadores de servicos essenciais, por obrigacao legal, por motivos de seguranca ou mediante autorizacao do utilizador.",
  },
  {
    title: "5. Cookies e tecnologias semelhantes",
    text: "Podemos usar cookies e tecnologias semelhantes para manter sessoes, melhorar desempenho, compreender o uso da plataforma e personalizar funcionalidades essenciais.",
  },
  {
    title: "6. Notificacoes",
    text: "Quando o leitor autoriza, podemos enviar alertas sobre noticias relevantes, edicoes digitais, actualizacoes de conta e informacoes do servico. Esta permissao pode ser alterada nas definicoes do dispositivo ou da aplicacao.",
  },
  {
    title: "7. Seguranca",
    text: "Aplicamos medidas tecnicas e organizacionais para reduzir riscos de acesso indevido, perda, alteracao ou divulgacao nao autorizada das informacoes.",
  },
  {
    title: "8. Direitos do utilizador",
    text: "O utilizador pode solicitar acesso, correcao, atualizacao ou eliminacao dos seus dados pessoais atraves dos contactos oficiais do Jornal O Destaque.",
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#eef0f3] text-[#111111]">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="border-t-4 border-[#061f5c] bg-white p-6 shadow-md sm:p-8">
          <div className="flex items-center gap-3 text-[#0b3d91]">
            <ShieldCheck className="h-6 w-6" />
            <span className="text-sm font-black uppercase tracking-wide">O Destaque</span>
          </div>
          <h1 className="mt-4 text-3xl font-black leading-tight text-[#111111] sm:text-5xl">
            Politica de Privacidade
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#555555] sm:text-lg">
            Esta pagina explica como o Jornal O Destaque trata informacoes no acesso a noticias locais de Mocambique,
            noticias do mundo, jornais digitais, favoritos, contas de utilizador, assinaturas e notificacoes.
          </p>
        </section>

        <section className="mt-5 border-l-4 border-[#0b3d91] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-black text-[#111111]">Compromisso com a privacidade</h2>
          <p className="mt-3 text-base leading-7 text-[#555555]">
            Respeitamos a privacidade dos nossos leitores e tratamos dados apenas para finalidades relacionadas com a
            prestacao, seguranca e melhoria dos nossos servicos editoriais e digitais.
          </p>
        </section>

        <section className="mt-5 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-black text-[#111111]">Entre em contacto</h2>
          <p className="mt-3 text-base leading-7 text-[#555555]">
            Para assuntos sobre noticias, conteudo editorial, privacidade, conta, assinatura ou suporte da aplicacao
            Jornal O Destaque - MZ, use os contactos oficiais abaixo.
          </p>

          <div className="mt-5 grid gap-4 text-base font-bold text-[#111111] md:grid-cols-3">
            <div className="border border-[#d7dce3] p-4">
              <MapPin className="mb-3 h-5 w-5 text-[#0b3d91]" />
              <p>Bairro do Jardim, Kamubucuana, Q.04, no 32.</p>
            </div>
            <div className="border border-[#d7dce3] p-4">
              <Phone className="mb-3 h-5 w-5 text-[#0b3d91]" />
              <p>+258 84 5349 690</p>
              <p>+258 86 8888 656</p>
              <p>+258 82 5465 026</p>
            </div>
            <div className="border border-[#d7dce3] p-4">
              <Mail className="mb-3 h-5 w-5 text-[#0b3d91]" />
              <a className="break-words underline" href="mailto:comercial@odestaque.co.mz">
                comercial@odestaque.co.mz
              </a>
            </div>
          </div>
        </section>

        <section className="mt-5 bg-white px-5 py-2 shadow-sm sm:px-6">
          {sections.map((section) => (
            <article key={section.title} className="border-b border-[#d7dce3] py-5 last:border-b-0">
              <h2 className="text-lg font-black text-[#111111]">{section.title}</h2>
              <p className="mt-2 text-base leading-7 text-[#555555]">{section.text}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t-4 border-[#061f5c] bg-[#111111] px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1fr_1.25fr]">
          <section>
            <div className="flex items-center gap-3">
              <img
                src="https://odestaque.co.mz/wp-content/uploads/2025/02/cropped-DESTAQUE-globo-SEM-FUNDO-180x180.png"
                alt="O Destaque"
                className="h-11 w-11 object-contain"
              />
              <span className="text-3xl font-black tracking-tight sm:text-4xl">DESTAQUE</span>
            </div>

            <div className="mt-6 space-y-4 text-base font-bold leading-7">
              <p className="flex gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0" />
                <span>Bairro do Jardim, Kamubucuana, Q.04, no 32.</span>
              </p>
              <p className="flex gap-3">
                <Phone className="mt-1 h-5 w-5 shrink-0" />
                <span>+258 84 5349 690 / +258 86 8888 656 / +258 82 5465 026</span>
              </p>
              <p className="flex gap-3">
                <Mail className="mt-1 h-5 w-5 shrink-0" />
                <a className="underline" href="mailto:comercial@odestaque.co.mz">
                  comercial@odestaque.co.mz
                </a>
              </p>
            </div>
          </section>

          <nav aria-label="Menu de navegacao">
            <h2 className="text-2xl font-black sm:text-3xl">Menu de Navegacao</h2>
            <div className="mt-3 h-[3px] bg-white" />
            <ul className="mt-5">
              {menuItems.map((item) => (
                <li key={item} className="border-b border-[#292929]">
                  <a href="/" className="flex min-h-12 items-center gap-2 text-base font-extrabold text-[#f3f4f6]">
                    <ChevronRight className="h-4 w-4 text-[#0b3d91]" strokeWidth={3} />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
