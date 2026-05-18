type Step = {
  number: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: "01",
    title: "옷 사진 업로드",
    description:
      "옷장 사진을 한 장씩 올리세요. 배경 정리, 카테고리·색상·스타일 분류는 AI가 자동으로 처리합니다.",
  },
  {
    number: "02",
    title: "내 전신 사진 한 장",
    description:
      "정면 사진 한 장이면 충분합니다. 체형과 분위기에 맞는 조합을 만들기 위한 기준이 됩니다.",
  },
  {
    number: "03",
    title: "AI 코디 결과",
    description:
      "가진 옷 안에서 어울리는 조합을 1~3가지 골라, 내 모습에 합성해서 보여줍니다. 좋아요/싫어요로 취향이 점점 정교해집니다.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-accent">어떻게 작동하나요</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            새 옷을 사는 대신,
            <br />
            가진 옷을 더 잘 입는 법.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted text-pretty">
            업로드부터 결과 확인까지 3단계. 첫 결과 이미지는 가입 후 30분 안에
            받아볼 수 있습니다.
          </p>
        </div>

        <ol className="mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.number}
              className="rounded-2xl border border-border bg-background p-6"
            >
              <div className="text-sm font-mono text-accent">{step.number}</div>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
