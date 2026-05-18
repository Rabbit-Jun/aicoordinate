type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  amplitudeApiKey: string;
};

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `환경변수 ${name} 가 설정되지 않았습니다. .env.local 또는 Vercel 환경변수를 확인하세요.`,
    );
  }
  return value;
}

// Next.js는 NEXT_PUBLIC_* 변수를 빌드 시점에 정적 대체한다.
// 정적 접근(process.env.NEXT_PUBLIC_FOO)만 inline되므로 동적 키 접근(process.env[name])은 금지.
export function getPublicEnv(): PublicEnv {
  return {
    supabaseUrl: required(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    supabaseAnonKey: required(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    amplitudeApiKey: required(
      "NEXT_PUBLIC_AMPLITUDE_API_KEY",
      process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
    ),
  };
}
