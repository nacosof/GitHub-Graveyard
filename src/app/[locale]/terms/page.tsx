import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage({ params }: { params: { locale: string } }) {
  const isRu = params.locale === "ru";
  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold">{isRu ? "Условия использования" : "Terms of Service"}</h1>
        <p className="mt-3 text-sm text-white/70">
          {isRu
            ? "Важная информация о правах и обязанностях. Не юридическая консультация."
            : "Important information about your rights and obligations. Not legal advice."}
        </p>

        <section className="mt-8 space-y-6 text-sm leading-6">
          <div>
            <h2 className="text-lg font-semibold">{isRu ? "1) Принятие условий" : "1) Acceptance"}</h2>
            <p className="mt-2">
              {isRu
                ? "Используя сайт GitHub Graveyard, вы соглашаетесь соблюдать настоящие Условия использования. Если вы не согласны — не используйте сервис."
                : "By using the GitHub Graveyard website, you agree to follow these Terms of Service. If you do not agree, do not use the service."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "2) Сервис" : "2) The service"}</h2>
            <p className="mt-2">
              {isRu
                ? "Мы помогаем находить забытые open-source репозитории, показываем сигналы из GitHub (например, коммиты, issues, PRs, звёзды), позволяя пользователям отмечать статус и поддерживать проекты «свечками»."
                : "We help you discover forgotten open-source repositories, display signals from GitHub (such as commits, issues, PRs, and stars), and allow users to label a repository’s status and support it with “candles”."}
            </p>
            <p className="mt-2">
              {isRu
                ? "Часть функций может отличаться в зависимости от окружения. Например, пополнение свечек отключено в production."
                : "Some features may vary depending on the environment. For example, candle top-ups are disabled in production."}
            </p>
            <p className="mt-2">
              {isRu
                ? "«Свечи» — это виртуальные единицы внутри сервиса. Сервис не продаёт реальные товары и не осуществляет обмен/вывод денег."
                : "“Candles” are virtual units inside the service. The service does not sell real goods and does not enable withdrawing or exchanging money."}
            </p>
            <p className="mt-2">
              {isRu
                ? "Если какие-то функции с оплатой будут включены, они могут зависеть от сторонних платёжных сервисов и их условий."
                : "If any paid features are enabled in the future, they may depend on third-party payment services and their terms."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "3) Аккаунты и безопасность" : "3) Accounts and security"}</h2>
            <p className="mt-2">
              {isRu
                ? "Для некоторых действий может требоваться регистрация и/или вход. Вы несёте ответственность за достоверность данных, которые предоставляете, и за сохранность ваших учетных данных."
                : "Some actions may require registration and/or sign-in. You are responsible for the accuracy of information you provide and for maintaining the security of your credentials."}
            </p>
            <p className="mt-2">
              {isRu
                ? "Если вы подозреваете несанкционированный доступ к вашему аккаунту — сообщите нам по адресу "
                : "If you suspect unauthorized access to your account — contact us at "}
              <a className="underline underline-offset-4" href="mailto:nacosof@gmail.com">
                nacosof@gmail.com
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "4) Возраст" : "4) Eligibility / age"}</h2>
            <p className="mt-2">
              {isRu
                ? "Вы заявляете, что вам исполнилось 13 лет (или установленный применимым законом более высокий возраст), чтобы использовать сервис."
                : "You represent that you are at least 13 years old (or the higher age required by applicable law) to use the service."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "5) Допустимое использование" : "5) Acceptable use"}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>{isRu ? "Не пытаться ломать, взламывать или обходить меры безопасности." : "Do not attempt to hack, bypass, or interfere with security."}</li>
              <li>{isRu ? "Не загружать вредоносные скрипты/контент и не спамить." : "Do not upload malicious code/content or spam."}</li>
              <li>{isRu ? "Не проводить чрезмерный автоматизированный сбор данных (scraping) и не создавать нагрузку." : "Do not perform excessive automated data collection (scraping) or create unreasonable load."}</li>
              <li>
                {isRu
                  ? "Использовать OAuth GitHub/Google и GitHub API в рамках их правил и условий."
                  : "Use GitHub/Google OAuth and the GitHub API in accordance with their rules and terms."}
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "6) Интеллектуальная собственность" : "6) Intellectual property"}</h2>
            <p className="mt-2">
              {isRu
                ? "Сайт и его интерфейс (код, дизайн, тексты) принадлежат GitHub Graveyard или предоставлены по лицензии. Репозитории и их содержимое остаются собственностью соответствующих правообладателей."
                : "The website and its UI (code, design, and text) belong to GitHub Graveyard or are used under license. Repositories and their content remain the property of their respective rights holders."}
            </p>
            <p className="mt-2">
              {isRu
                ? "GitHub/Google являются независимыми сервисами. GitHub Graveyard не является аффилированным с GitHub или Google и не управляет их продуктами."
                : "GitHub/Google are independent services. GitHub Graveyard is not affiliated with GitHub or Google and does not control their products."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "7) Содержимое и действия пользователя" : "7) User actions and labels"}</h2>
            <p className="mt-2">
              {isRu
                ? "Вы можете голосовать/отмечать статус репозиторов и поддерживать проекты свечками. Эти действия могут быть видны другим пользователям в рамках работы сервиса."
                : "You may vote/label repository statuses and support projects with candles. These actions may be visible to other users as part of the service."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "8) Авторские права (DMCA)" : "8) Copyright (DMCA)"}</h2>
            <p className="mt-2">
              {isRu
                ? "Если вы считаете, что какое-либо содержимое нарушает ваши авторские права — используйте раздел DMCA на сайте. Мы будем действовать в соответствии с применимым законодательством, включая механизмы notice-and-takedown."
                : "If you believe that any content infringes your copyright — use the DMCA section on the website. We will respond in accordance with applicable law, including notice-and-takedown mechanisms."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "9) Ограничение ответственности" : "9) Limitation of liability"}</h2>
            <p className="mt-2">
              {isRu
                ? "В максимально допустимой законом степени сервис предоставляется «как есть» и «как доступно» без каких-либо гарантий."
                : "To the maximum extent permitted by law, the service is provided “as is” and “as available” without warranties of any kind."}
            </p>
            <p className="mt-2">
              {isRu
                ? "Ни при каких обстоятельствах GitHub Graveyard не несёт ответственности за косвенные, случайные, специальные или последующие убытки."
                : "In no event will GitHub Graveyard be liable for indirect, incidental, special, or consequential damages."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "10) Прекращение" : "10) Termination"}</h2>
            <p className="mt-2">
              {isRu
                ? "Мы можем ограничить доступ или удалить аккаунт пользователя при нарушении условий, угрозе безопасности или злоупотреблении."
                : "We may restrict access or remove an account for violations, security threats, or abuse."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "11) Применимое право" : "11) Governing law"}</h2>
            <p className="mt-2">
              {isRu
                ? "В максимально допустимой законом степени настоящие условия регулируются правом Российской Федерации."
                : "To the maximum extent permitted by law, these Terms are governed by the laws of the Russian Federation."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "12) Контакт" : "12) Contact"}</h2>
            <p className="mt-2">
              {isRu ? "По вопросам: " : "Questions: "}
              <a className="underline underline-offset-4" href="mailto:nacosof@gmail.com">
                nacosof@gmail.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

