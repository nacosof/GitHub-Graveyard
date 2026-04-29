import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security",
};

export default function SecurityPage({ params }: { params: { locale: string } }) {
  const isRu = params.locale === "ru";
  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Security</h1>
        <p className="mt-3 text-sm text-white/70">
          {isRu
            ? "Порядок ответственного сообщения о проблемах безопасности. Мы просим сообщать уязвимости приватно и без вреда."
            : "Responsible vulnerability reporting guidelines. We ask you to report issues privately and without causing harm."}
        </p>

        <section className="mt-8 space-y-5 text-sm leading-6">
          <div>
            <h2 className="text-lg font-semibold">{isRu ? "Как сообщить об уязвимости" : "How to report a vulnerability"}</h2>
            <p className="mt-2">
              {isRu ? "Отправьте детали на " : "Send details to "}
              <a className="underline underline-offset-4" href="mailto:nacosof@gmail.com">
                nacosof@gmail.com
              </a>
              {isRu ? "." : "."}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>{isRu ? "Опишите влияние (impact) и затронутые компоненты/эндпоинты." : "Describe the impact and affected components/endpoints."}</li>
              <li>{isRu ? "Добавьте шаги для воспроизведения (без вреда и без попыток ломать данные)." : "Include steps to reproduce (without causing harm or data loss)."}</li>
              <li>{isRu ? "Proof-of-concept — только если это безопасно и ответственно." : "Proof-of-concept only if safe and responsible."}</li>
              <li>{isRu ? "Не публикуйте детали до согласования и выпуска исправления/плана." : "Do not publish details publicly before coordination and remediation."}</li>
              <li>{isRu ? "Не пытайтесь обходить ограничения доступа намеренно." : "Do not intentionally bypass access controls beyond what is necessary to prove the issue."}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "Вопросы" : "Questions"}</h2>
            <p className="mt-2">
              {isRu
                ? "Если не уверены, что ваш кейс подходит под ответственное сообщение — просто напишите письмо."
                : "If you are unsure whether your report fits responsible disclosure, just email us."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "Ожидания по срокам" : "Timing expectations"}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>{isRu ? "Мы постараемся ответить в течение 48 часов после получения сообщения." : "We will try to respond within 48 hours after receiving your report."}</li>
              <li>{isRu ? "Публичное раскрытие обычно согласуется после исправления." : "Public disclosure is usually coordinated after a fix or mitigation is available."}</li>
              <li>{isRu ? "Если исправление невозможно сразу — договоримся о разумном плане и сроках." : "If immediate remediation is not possible, we will coordinate a reasonable timeline."}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "В чем мы НЕ просим" : "What we do not ask for"}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>{isRu ? "Атаковать сервис (DDoS, массовые запросы, повреждение данных)." : "Do not attack the service (DDoS, data corruption, destructive actions)."}</li>
              <li>{isRu ? "Запрашивать доступ к приватным данным без разрешения." : "Do not request access to private data beyond what is necessary."}</li>
              <li>{isRu ? "Устраивать автоматизированные “сканирования ради сканирования” без цели." : "Do not run automated scans without a responsible goal."}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{isRu ? "Safe harbor (реталиация)" : "Safe harbor (no retaliation)"}</h2>
            <p className="mt-2">
              {isRu
                ? "Если вы добросовестно сообщаете о проблеме безопасности в рамках этой политики и не причиняете вреда, мы не будем предпринимать действия против вас за сам факт отчёта. Мы можем попросить вас уточнить детали или ограничить действия до выпуска исправления."
                : "If you report issues in good faith and in accordance with this policy without causing harm, we will not take action against you solely for making the report. We may ask you for clarification or to limit actions until remediation is available."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

