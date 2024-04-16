import styles from "./gpt-prompts.module.scss";
import { Flex, Radio, Card } from "antd";

export default function GptPrompts() {
  return (
    <div className="absolute bottom-full left-0 right-0">
      <div className="relative h-full w-full">
        <div className="h-full flex ml-1 md:w-full md:m-auto md:mb-4 gap-0 md:gap-2 justify-center">
          <div className="grow">
            <div className="absolute bottom-full left-0 mb-4 flex w-full grow gap-2 px-1 pb-1 sm:px-2 sm:pb-0 md:static md:mb-0 md:max-w-none">
              <div className="grid w-full grid-flow-row grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2">
                <Flex>
                  <Flex vertical>
                    <span className={styles["opacity_span"]}>
                      <button className="btn relative btn-neutral group w-full whitespace-nowrap rounded-xl px-4 py-3 text-left text-token-text-primary md:whitespace-normal">
                        <div className="flex w-full gap-2 items-center justify-center">
                          <div className="flex w-full items-center justify-between">
                            <Card title="比较营销策略" bordered={false}>
                              关于面向 Z 世代和千禧一代的太阳镜营销
                            </Card>
                            <div className="absolute bottom-0 right-0 top-0 flex items-center rounded-xl bg-gradient-to-l from-token-main-surface-secondary pl-6 pr-4 text-token-text-secondary opacity-0 can-hover:group-hover:opacity-100">
                              <span className="" data-state="closed">
                                <div className="rounded-lg bg-token-main-surface-primary p-1 shadow-xxs dark:shadow-none">
                                  <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="icon-sm text-token-text-primary"
                                  >
                                    <path
                                      d="M7 11L12 6L17 11M12 18V7"
                                      stroke="currentColor"
                                      stroke-width="2"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </span>
                    <span className={styles["opacity_span"]}>
                      <button className="btn relative btn-neutral group w-full whitespace-nowrap rounded-xl px-4 py-3 text-left text-token-text-primary md:whitespace-normal">
                        <div className="flex w-full gap-2 items-center justify-center">
                          <div className="flex w-full items-center justify-between">
                            <div className="flex flex-col overflow-hidden">
                              <div className="truncate">帮我调试</div>
                              <div className="truncate font-normal opacity-50">
                                一种链表问题
                              </div>
                            </div>
                            <div className="absolute bottom-0 right-0 top-0 flex items-center rounded-xl bg-gradient-to-l from-token-main-surface-secondary pl-6 pr-4 text-token-text-secondary opacity-0 can-hover:group-hover:opacity-100">
                              <span className="" data-state="closed">
                                <div className="rounded-lg bg-token-main-surface-primary p-1 shadow-xxs dark:shadow-none">
                                  <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="icon-sm text-token-text-primary"
                                  >
                                    <path
                                      d="M7 11L12 6L17 11M12 18V7"
                                      stroke="currentColor"
                                      stroke-width="2"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </span>
                  </Flex>
                  <Flex vertical>
                    <span className={styles["opacity_span"]}>
                      <button className="btn relative btn-neutral group w-full whitespace-nowrap rounded-xl px-4 py-3 text-left text-token-text-primary md:whitespace-normal">
                        <div className="flex w-full gap-2 items-center justify-center">
                          <div className="flex w-full items-center justify-between">
                            <div className="flex flex-col overflow-hidden">
                              <div className="truncate">比较营销策略</div>
                              <div className="truncate font-normal opacity-50">
                                关于面向 Z 世代和千禧一代的太阳镜营销
                              </div>
                            </div>
                            <div className="absolute bottom-0 right-0 top-0 flex items-center rounded-xl bg-gradient-to-l from-token-main-surface-secondary pl-6 pr-4 text-token-text-secondary opacity-0 can-hover:group-hover:opacity-100">
                              <span className="" data-state="closed">
                                <div className="rounded-lg bg-token-main-surface-primary p-1 shadow-xxs dark:shadow-none">
                                  <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="icon-sm text-token-text-primary"
                                  >
                                    <path
                                      d="M7 11L12 6L17 11M12 18V7"
                                      stroke="currentColor"
                                      stroke-width="2"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </span>
                    <span className={styles["opacity_span"]}>
                      <button className="btn relative btn-neutral group w-full whitespace-nowrap rounded-xl px-4 py-3 text-left text-token-text-primary md:whitespace-normal">
                        <div className="flex w-full gap-2 items-center justify-center">
                          <div className="flex w-full items-center justify-between">
                            <div className="flex flex-col overflow-hidden">
                              <div className="truncate">帮我调试</div>
                              <div className="truncate font-normal opacity-50">
                                一种链表问题
                              </div>
                            </div>
                            <div className="absolute bottom-0 right-0 top-0 flex items-center rounded-xl bg-gradient-to-l from-token-main-surface-secondary pl-6 pr-4 text-token-text-secondary opacity-0 can-hover:group-hover:opacity-100">
                              <span className="" data-state="closed">
                                <div className="rounded-lg bg-token-main-surface-primary p-1 shadow-xxs dark:shadow-none">
                                  <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="icon-sm text-token-text-primary"
                                  >
                                    <path
                                      d="M7 11L12 6L17 11M12 18V7"
                                      stroke="currentColor"
                                      stroke-width="2"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </span>
                  </Flex>
                </Flex>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
