type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  amplitudeApiKey: string;
};

function readRequired(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `환경변수 ${name} 가 설정되지 않았습니다. .env.local 또는 Vercel 환경변수를 확인하세요.`,
    );
  }
  return value;
}

export function getPublicEnv(): PublicEnv {
  return {
    supabaseUrl: readRequired("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: readRequired("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    amplitudeApiKey: readRequired("NEXT_PUBLIC_AMPLITUDE_API_KEY"),
  };
}
