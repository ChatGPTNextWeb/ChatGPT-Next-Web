import { STORAGE_KEY, REPO_URL } from "@/app/constant";
import { chunks } from "../format";
import { SyncStore } from "@/app/store/sync";
import { corsFetch } from "../cors";

export type GistConfig = SyncStore["githubGist"] & { gistId: string };
export type GistClient = ReturnType<typeof createGistClient>;

export function createGistClient(store: SyncStore) {
  let gistId = store.githubGist.gistId;
  const token = store.githubGist.token;
  const fileBackup = store.githubGist.filename;
  const currentDate = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  // a proxy disable for a tmp since github doesn't need proxy url
  const proxyUrl =
    store.useProxy && store.proxyUrl.length > 0 ? store.proxyUrl : undefined;

  return {
    async create(content: string) {
      const description = `[200 OK] [GithubSync] Last Sync: ${currentDate} Site: ${REPO_URL}`;

      const contentChunks = [...chunks(content)];
      const files: { [key: string]: { content: string } } = {};

      for (let i = 0; i < contentChunks.length; i++) {
        const fileName = i === 0 ? fileBackup : `${fileBackup}_${i}`;
        files[fileName] = {
          content: contentChunks[i],
        };
      }

      return corsFetch("https://api.github.com/gists", {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          public: false,
          description,
          files,
        }),
      })
        .then((res) => {
          console.log(
            "[Gist] Create A File Name",
            `${fileBackup}`,
            res.status,
            res.statusText,
          );
          if (res.status === 201) {
            return res.json().then((data) => {
              gistId = data.id; // Update the gistId with the new Gist ID
              return gistId;
            });
          }
          return null;
        })
        .catch((error) => {
          console.error("[Gist] Create A File Name", `${fileBackup}`, error);
          return null;
        });
    },

    async check(): Promise<string> {
      const res = await corsFetch(this.path(gistId), {
        method: "GET",
        headers: this.headers(),
      });

      console.log("[Gist] Check A File Name", res.status, res.statusText);

      if (res.status === 200) {
        return "success"; // Return success if the Gist exists
      } else if (res.status === 404) {
        return "failed"; // Return failed if the Gist doesn't exist
      }

      return ""; // Return an empty string for other cases
    },

    async get() {
      const res = await corsFetch(this.path(gistId), {
        method: "GET",
        headers: this.headers(),
      });

      console.log(
        "[Gist] Get A File Name",
        `${fileBackup}`,
        res.status,
        res.statusText,
      );

      if (res.status === 200) {
        const data = await res.json();
        return data.files[fileBackup]?.content ?? "";
      }

      return "";
    },

    async set(data: object) {
      const existingContent = await this.check();
      const newContent = JSON.stringify(data, null, 2);
      const description = `[Sync] [200 OK] [GithubGist] Last Sync: ${currentDate} Site: ${REPO_URL}`;

      return corsFetch(this.path(gistId), {
        method: existingContent ? "PATCH" : "POST",
        headers: this.headers(),
        body: JSON.stringify({
          description,
          files: {
            [fileBackup]: {
              content: newContent,
            },
          },
        }),
      })
        .then((res) => {
          console.log(
            "[Gist] Set A Data oF File Name",
            `${fileBackup}`,
            res.status,
            res.statusText,
          );
          return newContent;
        })
        .catch((error) => {
          console.error(
            "[Gist] Set A Data oF File Name",
            `${fileBackup}`,
            error,
          );
          return "";
        });
    },

    headers() {
      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    },

    path(gistId: string) {
      return `https://api.github.com/gists/${gistId}`;
    },
  };
}
