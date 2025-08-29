"use client";
import { useQuery } from "@tanstack/react-query";
import { getGitHubReps } from "../libs/github-repos";
import { useMemo, type FormEventHandler, type MouseEventHandler } from "react";
import { DateString } from "../libs/date-string";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const { data, isLoading } = useQuery({
    queryKey: ["repos", name],
    queryFn: () => getGitHubReps(name),
    enabled: !!name,
  });
  const sortIndex = Number(searchParams.get("sort") || "0");
  const items = useMemo(() => {
    return data
      ?.map((v, index) => ({ ...v, index }))
      .sort((srcA, srcB) => {
        const [a, b] = sortIndex < 0 ? [srcB, srcA] : [srcA, srcB];
        switch (Math.abs(sortIndex)) {
          case 1:
            return a.index - b.index;
          case 2:
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          case 3:
            return a.html_url < b.html_url ? -1 : 1;
          case 4:
            return a.stargazers_count - b.stargazers_count;
        }
      });
  }, [data, sortIndex]);
  const handleHeader: MouseEventHandler<HTMLElement> = (e) => {
    const index = Number(e.currentTarget.dataset["index"]) + 1;
    const url = new URL(location.href);
    url.searchParams.set("sort", String(sortIndex === index ? -index : index));
    router.replace(url.toString());
  };
  const handleLink = (url: string) => {
    window.open(url, "_blank");
  };
  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const url = new URL(location.href);
    url.searchParams.set("name", e.currentTarget.maintainer.value);
    router.replace(url.toString());
  };
  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-1">
        <input
          name="maintainer"
          className="input input-bordered w-full max-w-xs"
          defaultValue={name}
        />
        <button className="btn" type="submit">
          設定
        </button>
        <Link
          href="https://github.com/SoraKumo001/next-github-stars"
          className="underline"
          target="_blank"
        >
          Source Code
        </Link>
      </form>

      {isLoading && <div>Loading</div>}
      {data && (
        <>
          <div>⭐: {items.reduce((a, b) => a + b.stargazers_count, 0)}</div>
          <table className="table [&_*]:border-gray-300 [&_td]:border-x [&_td,&_th]:p-1 [&_th:hover]:bg-slate-100 [&_th]:border-x ">
            <thead>
              <tr className="sticky top-0 cursor-pointer bg-white text-lg font-semibold z-10">
                {["NO", "Created", "URL", "Stars"].map((v, index) => (
                  <th key={v} onClick={handleHeader} data-index={index}>
                    {v}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr:nth-child(odd)]:bg-slate-200 [&_td]:group-hover:backdrop-brightness-90 [&_tr]:relative [a]:absolute [a]:inset-0 bg-red">
              {items?.map(
                ({ id, created_at, html_url, stargazers_count, index }) => (
                  <tr
                    key={id}
                    className="group cursor-pointer"
                    onClick={() => handleLink(html_url)}
                  >
                    <td>{index + 1}</td>
                    <td>{DateString(created_at)}</td>
                    <td>{html_url}</td>
                    <td className="overflow-visible">{stargazers_count}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Page;
