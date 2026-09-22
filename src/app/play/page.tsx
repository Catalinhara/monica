import { redirect } from "next/navigation";

type PlayPageProps = {
  searchParams: Promise<{ preview?: string }>;
};

export default async function PlayPage({ searchParams }: PlayPageProps) {
  const params = await searchParams;
  const query = params.preview === "1" ? "?preview=1" : "";
  redirect(`/monica${query}`);
}
