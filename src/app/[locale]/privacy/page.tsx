import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage({ params }: { params: { locale: string } }) {
  const isRu = params.locale === "ru";
  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold">{isRu ? "Политика конфиденциальности" : "Privacy Policy"}</h1>
        <p className="mt-3 text-sm text-white/70">
          {isRu
            ? "Это описание того, как GitHub Graveyard обрабатывает персональные данные. Не юридическая консультация."
            : "This document explains how GitHub Graveyard processes personal data. Not legal advice."}
        </p>

        <section className="mt-8 space-y-5 text-sm leading-6">
          <div>
            <h2 className="text-lg font-semibold">{isRu ? "1) Кто мы" : "1) Who we are"}</h2>
            <p className="mt-2">
              {isRu
                ? "GitHub Graveyard — это веб-сервис для поиска, обзора и переоценки open-source репозиториев на GitHub. Сервис помогает пользователям находить забытые, завершённые или недооценённые проекты, просматривать сигналы активности (например, commits, issues, pull requests и stars), отмечать статус репозиториев и поддерживать интересные проекты с помощью виртуальных «candles»."
                : "GitHub Graveyard is a web service for discovering, reviewing, and reassessing open-source repositories on GitHub. The service helps users find forgotten, completed, or underrated projects, view repository activity signals (such as commits, issues, pull requests, and stars), label repository status, and support interesting projects using virtual “candles”."}
              <br />
              Email:{" "}
              <a className="underline underline-offset-4" href="mailto:nacosof@gmail.com">
                nacosof@gmail.com
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "2) Какие данные мы собираем" : "2) What data we collect"}</h2>
            <p className="mt-2">
              {isRu
                ? "Мы собираем данные, которые нужны, чтобы ты мог пользоваться сервисом: "
                : "We collect data needed to provide the service: "}
              <span className="text-white/80">
                {isRu ? "аккаунт, сессии, действия в профиле, и технические данные." : "account, sessions, profile activity, and technical data."}
              </span>
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                {isRu
                  ? "Данные аккаунта: username, email, флаг подтверждения (verified), и хэш пароля (пароль мы не храним в открытом виде)."
                  : "Account data: username, email, email verification status (verified), and a password hash (we never store passwords in plain text)."}
              </li>
              <li>
                {isRu
                  ? "OAuth-данные: когда ты входишь через GitHub или Google, NextAuth создаёт/использует аккаунт и может получать email, display name, providerAccountId и изображение профиля (если оно возвращается провайдером)."
                  : "OAuth data: when you sign in with GitHub or Google, NextAuth may receive email, display name, providerAccountId and profile image (if the provider returns it)."}
              </li>
              <li>
                {isRu
                  ? "Сессии и cookies: используются cookies для аутентификации, включая `gg_session` и cookies NextAuth."
                  : "Sessions and cookies: cookies are used for authentication, including `gg_session` and NextAuth cookies."}
              </li>
              <li>
                {isRu
                  ? "Данные действий: свечки/донаты, голосования и метки категорий, которые связаны с твоим аккаунтом."
                  : "User activity: candles/donations, votes, and category labels associated with your account."}
              </li>
              <li>
                {isRu
                  ? "Админ-метрики: мы используем поле `lastSeenAt` и считаем «online» как пользователей, которые были активны в последние ~5 минут. Этот показатель виден только администратору."
                  : "Admin metrics: we use `lastSeenAt` and calculate “online” as users active within the last ~5 minutes. This metric is visible only to the administrator."}
              </li>
              <li>
                {isRu
                  ? "Email-общение: коды подтверждения email и коды сброса пароля."
                  : "Email communication: email verification codes and password reset codes."}
              </li>
              <li>
                {isRu
                  ? "Технические данные: информация о запросах, обычно включая IP-адрес и user agent, которую могут хранить хостинг и инфраструктура Next.js/NextAuth."
                  : "Technical data: request-related information such as IP address and user agent that may be logged by hosting and Next.js/NextAuth infrastructure."}
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "3) Зачем мы используем данные" : "3) How we use data"}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                {isRu ? "Чтобы создать и поддерживать твой аккаунт и доступ к профилю." : "To create and maintain your account and access your profile."}
              </li>
              <li>
                {isRu
                  ? "Чтобы отправлять письма: подтверждение регистрации и сброс пароля."
                  : "To send transactional emails: verification and password resets."}
              </li>
              <li>
                {isRu ? "Чтобы показывать свечи/статы и отражать твои действия." : "To display candles/stats and reflect your actions."}
              </li>
              <li>
                {isRu
                  ? "Чтобы обеспечивать безопасность, снижать злоупотребления и ограничивать подозрительные активности."
                  : "To maintain security, reduce abuse, and help prevent suspicious activity."}
              </li>
              <li>
                {isRu
                  ? "Чтобы интегрироваться с внешними сервисами: GitHub/Google OAuth и GitHub API для сигналов репозиториев."
                  : "To integrate with external services: GitHub/Google OAuth and GitHub API signals for repositories."}
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "4) Правовые основания" : "4) Legal bases"}</h2>
            <p className="mt-2">
              {isRu
                ? "В тех случаях, когда применяется GDPR/UK GDPR, мы обычно опираемся на: договор (когда ты создаёшь аккаунт), законные интересы (безопасность и предотвращение злоупотреблений), и согласие там, где это требуется."
                : "Where GDPR/UK GDPR applies, we typically rely on: contract (when you create an account), legitimate interests (security and abuse prevention), and consent where required."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "5) С кем мы делимся данными" : "5) Who we share data with"}</h2>
            <p className="mt-2">
              {isRu
                ? "Мы передаём персональные данные только тем, кому нужно для работы сервиса, например:"
                : "We share personal data only when needed to run the service, for example:"}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                {isRu ? "OAuth-провайдеры: GitHub и Google." : "OAuth providers: GitHub and Google."}
              </li>
              <li>
                {isRu
                  ? "Платёжный провайдер (для пополнения виртуальных «свечей»): NOWPayments. Мы передаём данные, необходимые для создания заказа/инвойса и обработки статусов оплаты."
                  : "Payment provider (for topping up virtual “candles”): NOWPayments. We share the data required to create an order/invoice and process payment status updates."}
              </li>
              <li>
                {isRu ? "Email-провайдер: Resend или SMTP (если настроен)." : "Email provider: Resend or SMTP (if configured)."}
              </li>
              <li>
                {isRu ? "Хостинг и инфраструктура: платформы, которые размещают сайт и базу данных." : "Hosting and infrastructure: platforms that host the site and database."}
              </li>
              <li>
                {isRu
                  ? "База данных/ORM: Prisma + Postgres/Serverless Postgres."
                  : "Database/ORM: Prisma + Postgres/Serverless Postgres."}
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "6) Передача данных за пределы страны/ЕС" : "6) International transfers"}</h2>
            <p className="mt-2">
              {isRu
                ? "OAuth и email-провайдеры могут обрабатывать данные в разных странах. Мы предпринимаем разумные шаги, чтобы передача соответствовала требованиям применимого законодательства (включая стандартные механизмы передачи там, где это требуется)."
                : "OAuth and email providers may process data in different countries. We take reasonable steps to ensure transfers comply with applicable laws (including appropriate safeguards where required)."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "7) Сроки хранения" : "7) Retention"}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                {isRu
                  ? "Коды подтверждения email и коды сброса пароля действуют 10 минут и после завершения/истечения удаляются."
                  : "Email verification and password reset codes are valid for 10 minutes and are deleted after use or expiration."}
              </li>
              <li>
                {isRu
                  ? "Cookie `gg_session` хранится до 30 дней (для удобства входа)."
                  : "`gg_session` cookie is stored for up to 30 days (for convenience)."}
              </li>
              <li>
                {isRu
                  ? "Сессии NextAuth хранятся и истекают в соответствии с настройками NextAuth (и записью сессии в базе данных)."
                  : "NextAuth sessions are stored and expire according to NextAuth settings (and their session record in the database)."}
              </li>
              <li>
                {isRu
                  ? "Данные аккаунта хранятся до удаления аккаунта или пока это нужно для целей, описанных в этой политике."
                  : "Account data is stored until you delete your account or until it is no longer needed for the purposes described in this policy."}
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "8) Права пользователей" : "8) Your rights"}</h2>
            <p className="mt-2">
              {isRu
                ? "В зависимости от юрисдикции вы можете запросить доступ к своим данным, исправление, удаление, ограничение обработки, а также подать жалобу в уполномоченный орган."
                : "Depending on your jurisdiction, you may request access, rectification, deletion, restriction of processing, and you may lodge a complaint with the relevant supervisory authority."}
            </p>
            <p className="mt-2">
              {isRu ? "Напишите нам по адресу " : "Contact us at "}
              <a className="underline underline-offset-4" href="mailto:nacosof@gmail.com">
                nacosof@gmail.com
              </a>
              {isRu ? "." : "."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "9) Cookies" : "9) Cookies"}</h2>
            <p className="mt-2">
              {isRu
                ? "Мы используем cookies в первую очередь для аутентификации и поддержания сессии. Среди них `gg_session` (httpOnly) и cookies NextAuth."
                : "We use cookies primarily for authentication and session management. This includes the `gg_session` cookie (httpOnly) and NextAuth cookies."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "10) Безопасность" : "10) Security"}</h2>
            <p className="mt-2">
              {isRu
                ? "Мы используем разумные технические и организационные меры для защиты данных, включая хэширование паролей и использование httpOnly cookie для сессий."
                : "We use reasonable technical and organizational measures to protect data, including password hashing and httpOnly cookies for sessions."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "11) Детские данные" : "11) Children"}</h2>
            <p className="mt-2">
              {isRu ? "Сервис предназначен для пользователей старше 13 лет." : "The service is intended for users aged 13 or older."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "12) Изменения" : "12) Changes"}</h2>
            <p className="mt-2">
              {isRu
                ? "Мы можем обновлять эту Политику. Новая версия публикуется на сайте."
                : "We may update this policy. The latest version will be published on the site."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

