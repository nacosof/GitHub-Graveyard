import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DMCA / Copyright",
};

export default function DmcaPage({ params }: { params: { locale: string } }) {
  const isRu = params.locale === "ru";
  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold">DMCA / Copyright</h1>
        <p className="mt-3 text-sm text-white/70">
          {isRu
            ? "Раздел для уведомлений об авторских правах (notice-and-takedown). Если вы считаете, что контент нарушает ваши права — отправьте корректное уведомление на email ниже."
            : "For copyright takedown notices (notice-and-takedown). If you believe content infringes your rights, send a compliant notice to the email below."}
        </p>

        <section className="mt-8 space-y-5 text-sm leading-6">
          <div>
            <h2 className="text-lg font-semibold">{isRu ? "Доверенный агент DMCA" : "DMCA designated agent"}</h2>
            <p className="mt-2">
              {isRu ? "Мы назначили агентом для уведомлений об авторских правах: " : "We designate the following agent for copyright notices: "}
              <br />
              <span className="font-semibold">nacosof</span>
              <br />
              <a className="underline underline-offset-4" href="mailto:nacosof@gmail.com">
                nacosof@gmail.com
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "Как отправить уведомление" : "How to send a notice"}</h2>
            <p className="mt-2">
              {isRu ? "Отправьте email на " : "Send an email to "}
              <a className="underline underline-offset-4" href="mailto:nacosof@gmail.com">
                nacosof@gmail.com
              </a>
              .
            </p>
            <p className="mt-2">
              {isRu
                ? "В уведомлении укажите, пожалуйста, следующую информацию (это помогает выполнить требования notice-and-takedown):"
                : "In your notice, please include the following information (to help us process your notice under notice-and-takedown):"}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>{isRu ? "Электронная или физическая подпись заявителя (как текст в письме)." : "A signature (electronic or physical, included in the email text)."}</li>
              <li>{isRu ? "Описание защищаемого авторским правом произведения." : "Identification of the copyrighted work."}</li>
              <li>
                {isRu ? "Описание/идентификация предполагаемого нарушающего контента (URL, ссылка, иные сведения)." : "Identification of the allegedly infringing material (URL or other sufficient information)."}
              </li>
              <li>{isRu ? "Ваши контактные данные (имя, email, при наличии — телефон/адрес)." : "Your contact information (name, email, and optionally phone/address)."}</li>
              <li>
                {isRu
                  ? "Заявление добросовестной уверенности, что использование контента не разрешено правообладателем, его представителем или законом."
                  : "A statement of good-faith belief that the material is not authorized by the rights holder, its agent, or the law."}
              </li>
              <li>
                {isRu
                  ? "Заявление (под присягой/под страхом ответственности), что информация в уведомлении точна и вы уполномочены действовать от имени правообладателя."
                  : "A statement, under penalty of perjury, that the notice is accurate and you are authorized to act on behalf of the rights holder."}
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "Обработка и безопасная гавань" : "Processing & safe harbor"}</h2>
            <p className="mt-2">
              {isRu
                ? "Мы будем принимать и рассматривать уведомления в соответствии с применимым законодательством, включая механизмы notice-and-takedown."
                : "We will receive and review notices in accordance with applicable law, including notice-and-takedown mechanisms."}
            </p>
            <p className="mt-2">
              {isRu
                ? "Чтобы иметь возможность воспользоваться механизмами safe harbor, уведомления должны быть корректными и содержать все существенные сведения."
                : "To be eligible for safe-harbor mechanisms, notices should be complete and contain all required information."}
            </p>
            <p className="mt-2">
              {isRu
                ? "Если вы отправляете уведомление в рамках DMCA, это делается в адрес нашего designated agent."
                : "If you submit under the DMCA, this notice is sent to our designated agent."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "Counter-Notice (если контент сняли по ошибке)" : "Counter-Notice (if you believe removal was a mistake)"}</h2>
            <p className="mt-2">
              {isRu
                ? "Если вы считаете, что контент был удалён/заблокирован ошибочно — вы можете отправить counter-notice. Укажите в письме, почему вы считаете решение неверным, и предоставьте контактные данные."
                : "If you believe content was removed or blocked in error, you may submit a counter-notice. Explain why you believe the removal was incorrect and include your contact details."}
            </p>
            <p className="mt-2">
              {isRu
                ? "Counter-notice может требовать соблюдения требований 17 U.S.C. §512(g). Мы можем восстановить доступ к контенту после истечения установленного законом срока, если не будет подано судебное уведомление."
                : "Counter-notice may require compliance with requirements of 17 U.S.C. §512(g). We may restore access after the statutory waiting period unless we receive a court order notice."}
            </p>
            <p className="mt-2">
              {isRu ? "Мы свяжемся с вами по email." : "We will respond by email."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

