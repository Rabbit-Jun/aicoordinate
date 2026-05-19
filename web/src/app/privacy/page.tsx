import type { Metadata } from "next";
import Link from "next/link";

const effectiveDate = "2026년 5월 19일";
const contactEmail = "hello@example.com"; // TODO: 운영 시작 전 실제 이메일로 교체

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "AI 코디 베타 대기열 서비스의 개인정보 수집·이용·보유에 관한 처리방침.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <article className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
        <Link
          href="/"
          className="text-sm font-medium text-muted hover:text-foreground transition"
        >
          ← 홈으로
        </Link>

        <h1 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight">
          개인정보처리방침
        </h1>
        <p className="mt-2 text-sm text-muted">시행일: {effectiveDate}</p>

        <div className="mt-12 space-y-10 leading-relaxed text-foreground/90">
          <Section title="1. 수집하는 개인정보 항목">
            <p>
              본 서비스(이하 “회사”)는 베타 대기열 등록 및 가설 검증을 위해
              다음 정보를 수집합니다.
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-1.5 text-foreground/80">
              <li>
                <strong>필수 수집</strong>: 이메일 주소
              </li>
              <li>
                <strong>자동 수집</strong>: 접속 IP, 브라우저·기기 정보
                (User-Agent), 접속 시각, 유입 경로(utm_source), 리퍼러 URL,
                페이지 내 행동 데이터(클릭·스크롤·세션 재생)
              </li>
            </ul>
          </Section>

          <Section title="2. 개인정보의 수집·이용 목적">
            <ul className="list-disc pl-6 space-y-1.5 text-foreground/80">
              <li>베타 서비스 슬롯 안내 이메일 발송</li>
              <li>
                가설 검증을 위한 사용자 행동 분석 (집계 기준, 개별 식별 목적
                아님)
              </li>
              <li>부정 가입·중복 등록 방지</li>
            </ul>
          </Section>

          <Section title="3. 보유·이용 기간">
            <p>
              회사는 베타 서비스가 종료될 때까지 또는 정보주체의 삭제 요청 시까지
              개인정보를 보유합니다. 관련 법령에 따른 보존 의무가 있는 경우 해당
              기간 동안 분리 보관합니다.
            </p>
          </Section>

          <Section title="4. 제3자 제공 및 처리 위탁">
            <p>
              <strong>제3자 제공</strong>: 회사는 사용자의 동의 없이 개인정보를
              제3자에게 제공하지 않으며, 광고 목적으로 정보를 판매하지
              않습니다.
            </p>
            <p className="mt-3">
              <strong>처리 위탁</strong>: 서비스 운영을 위해 다음 해외
              사업자에게 일부 정보 처리를 위탁합니다.
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-1.5 text-foreground/80">
              <li>
                <strong>Supabase Inc.</strong> (미국) — 데이터베이스 저장
              </li>
              <li>
                <strong>Amplitude Inc.</strong> (미국) — 사용자 행동 분석,
                Session Replay
              </li>
              <li>
                <strong>Vercel Inc.</strong> (미국) — 웹 호스팅
              </li>
            </ul>
            <p className="mt-3 text-sm text-muted">
              위탁사들은 SOC 2 등 국제 보안 인증을 보유하며, 위탁 계약 종료 시
              관련 데이터를 파기합니다.
            </p>
          </Section>

          <Section title="5. 정보주체의 권리">
            <p>
              정보주체는 본인의 개인정보에 대해 다음 권리를 행사할 수 있습니다.
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-1.5 text-foreground/80">
              <li>개인정보 열람·정정·삭제 요청</li>
              <li>개인정보 처리 정지 요청</li>
              <li>수집·이용 동의 철회</li>
            </ul>
            <p className="mt-3">
              요청 방법:{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-accent hover:underline"
              >
                {contactEmail}
              </a>
              로 이메일 발송. 영업일 기준 7일 이내 처리합니다.
            </p>
          </Section>

          <Section title="6. 쿠키 및 자동 수집 도구">
            <p>
              Amplitude SDK는 익명 식별자(쿠키 또는 LocalStorage)를 사용해 동일
              사용자의 행동을 시간 순서대로 연결합니다. 브라우저 설정에서 쿠키를
              차단할 수 있으나, 일부 기능이 정상 동작하지 않을 수 있습니다.
            </p>
          </Section>

          <Section title="7. 개인정보 보호책임자 및 문의">
            <p>
              개인정보 처리와 관련한 문의·불만·피해구제 요청은 아래 연락처로
              부탁드립니다.
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-1.5 text-foreground/80">
              <li>
                이메일:{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-accent hover:underline"
                >
                  {contactEmail}
                </a>
              </li>
            </ul>
          </Section>

          <Section title="8. 변경 이력">
            <ul className="list-disc pl-6 space-y-1.5 text-foreground/80">
              <li>{effectiveDate} — 최초 시행</li>
            </ul>
          </Section>
        </div>
      </article>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-4 text-base text-foreground/80">{children}</div>
    </section>
  );
}
