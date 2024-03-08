// copied from Su Wei's code coach project

import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime"; // ES Modules import
import { STS } from "@aws-sdk/client-sts";

import {
  SubmitKey,
  useChatStore,
  Theme,
  useUpdateStore,
  useAccessStore,
  useAppConfig,
} from "@/app/store";
import { MultimodalContent } from "../api";

const AWSRegion = process.env.AWS_REGION ?? "us-west-2";

interface AWSConfigWithCredentials {
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

interface AWSConfigWithRegionOnly {
  region: string;
}

type AWSConfigReturnType = AWSConfigWithCredentials | AWSConfigWithRegionOnly;

interface AuthProps {
  authType?: string;
  akValue?: string;
  skValue?: string;
  awsRegionValue?: string;
}

// const accessStore = useAccessStore();

/**
 * Generates the configuration object for AWS SDK based on the authentication type.
 *
 * @returns {AWSConfigReturnType} The AWS configuration object with either credentials or just the region.
 */
const AWSConfig = (): AWSConfigReturnType => {
  // return {

  //   region: accessStore.awsRegion,
  //   credentials: {
  //     accessKeyId: accessStore.awsAccessKeyId,
  //     secretAccessKey: accessStore.awsSecretAccessKey,
  //   }
  // }

  return {
    region: AWSRegion,
    credentials: {
      accessKeyId: "accessStore.awsAccessKeyId",
      secretAccessKey: "accessStore.awsSecretAccessKey",
    },
  };
};

class STSClient {
  client: STS;

  constructor(config: AWSConfigReturnType) {
    this.client = new STS(config);
  }

  async getCallerIdentity() {
    return this.client.getCallerIdentity({});
  }
}

class BedrockClient {
  client: BedrockRuntimeClient;

  constructor(config: AWSConfigReturnType) {
    this.client = new BedrockRuntimeClient(config);
  }

  async invokeModelWithStream(payload: any, modelId: string) {
    const input = {
      body: JSON.stringify(payload),
      contentType: "application/json",
      accept: "application/json",
      modelId,
    };

    const command = new InvokeModelWithResponseStreamCommand(input);
    return this.client.send(command);
  }

  async invokeModel(payload: any, modelId: string) {
    const input = {
      body: JSON.stringify(payload),
      contentType: "application/json",
      accept: "application/json",
      modelId,
    };

    const command = new InvokeModelCommand(input);
    return this.client.send(command);
  }
}

export { AWSConfig, BedrockClient, STSClient, AWSRegion };

export type { AuthProps };
