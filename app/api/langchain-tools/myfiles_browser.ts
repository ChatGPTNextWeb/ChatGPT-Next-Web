import { Tool } from "@langchain/core/tools";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { formatDocumentsAsString } from "langchain/util/document";
import { Embeddings } from "langchain/dist/embeddings/base.js";
import { getServerSideConfig } from "@/app/config/server";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";

export class MyFilesBrowser extends StructuredTool {
  static lc_name() {
    return "MyFilesBrowser";
  }

  get lc_namespace() {
    return [...super.lc_namespace, "myfilesbrowser"];
  }

  private sessionId: string;
  private model: BaseLanguageModel;
  private embeddings: Embeddings;

  constructor(
    sessionId: string,
    model: BaseLanguageModel,
    embeddings: Embeddings,
  ) {
    super();
    this.sessionId = sessionId;
    this.model = model;
    this.embeddings = embeddings;
  }

  schema = z.object({
    queries: z.array(z.string()).describe("A query list."),
  });

  /** @ignore */
  async _call({ queries }: z.infer<typeof this.schema>) {
    const serverConfig = getServerSideConfig();
    if (!serverConfig.isEnableRAG)
      throw new Error("env ENABLE_RAG not configured");

    const privateKey = process.env.SUPABASE_PRIVATE_KEY;
    if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);

    const url = process.env.SUPABASE_URL;
    if (!url) throw new Error(`Expected env var SUPABASE_URL`);
    const client = createClient(url, privateKey);
    const vectorStore = new SupabaseVectorStore(this.embeddings, {
      client,
      tableName: "documents",
      queryName: "match_documents",
    });

    let context;
    const returnCunt = serverConfig.ragReturnCount
      ? parseInt(serverConfig.ragReturnCount, 10)
      : 4;
    console.log("[myfiles_browser]", { queries, returnCunt });
    let documents: any[] = [];
    for (var i = 0; i < queries.length; i++) {
      let results = await vectorStore.similaritySearch(queries[i], returnCunt, {
        sessionId: this.sessionId,
      });
      results.forEach((item) => documents.push(item));
    }
    context = formatDocumentsAsString(documents);
    console.log("[myfiles_browser]", { context });
    return context;
  }

  name = "myfiles_browser";

  description = `queries to a search over the file(s) uploaded in the current conversation and displays the results.`;
}
