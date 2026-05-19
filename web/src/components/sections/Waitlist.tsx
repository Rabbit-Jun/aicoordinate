import { WaitlistForm } from "./WaitlistForm";

export function Waitlist() {
  return (
    <section id="waitlist" className="border-t border-border overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-medium text-accent">베타 대기열</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-balance">
              먼저 써 보고,
              <br />
              피드백으로 함께 만들어요.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted text-pretty">
              이메일을 남겨주시면, 베타 슬롯이 열리는 대로 가장 먼저
              안내드립니다. 초기 사용자에게는 무료 사용권과 함께 직접 코디
              결과를 만들어드려요.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              <li>· 가입은 무료, 광고용 정보 판매 없음</li>
              <li>· 베타 안내 외 다른 메일은 보내지 않습니다</li>
              <li>· 언제든 1초 만에 등록 취소 가능</li>
            </ul>
          </div>

          <div className="flex lg:justify-end">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}
