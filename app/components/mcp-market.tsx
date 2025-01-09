import { IconButton } from "./button";
import { ErrorBoundary } from "./error";
import styles from "./mcp-market.module.scss";
import EditIcon from "../icons/edit.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import DeleteIcon from "../icons/delete.svg";
import RestartIcon from "../icons/reload.svg";
import EyeIcon from "../icons/eye.svg";
import { List, ListItem, Modal, showToast } from "./ui-lib";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import presetServersJson from "../mcp/preset-server.json";
const presetServers = presetServersJson as PresetServer[];
import {
  getMcpConfig,
  updateMcpConfig,
  getClientPrimitives,
  restartAllClients,
  getClientErrors,
  refreshClientStatus,
} from "../mcp/actions";
import { McpConfig, PresetServer, ServerConfig } from "../mcp/types";
import clsx from "clsx";

interface ConfigProperty {
  type: string;
  description?: string;
  required?: boolean;
  minItems?: number;
}

export function McpMarketPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [config, setConfig] = useState<McpConfig>({ mcpServers: {} });
  const [editingServerId, setEditingServerId] = useState<string | undefined>();
  const [viewingServerId, setViewingServerId] = useState<string | undefined>();
  const [primitives, setPrimitives] = useState<any[]>([]);
  const [userConfig, setUserConfig] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [clientErrors, setClientErrors] = useState<
    Record<string, string | null>
  >({});

  // 更新服务器状态
  const updateServerStatus = async () => {
    await refreshClientStatus();
    const errors = await getClientErrors();
    setClientErrors(errors);
  };

  // 初始加载配置
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const data = await getMcpConfig();
        setConfig(data);
        await updateServerStatus();
      } catch (error) {
        showToast("Failed to load configuration");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // 保存配置
  const saveConfig = async (newConfig: McpConfig) => {
    try {
      setIsLoading(true);
      await updateMcpConfig(newConfig);
      setConfig(newConfig);
      // 配置改变时需要重新初始化
      await restartAllClients();
      await updateServerStatus();
      showToast("Configuration saved successfully");
    } catch (error) {
      showToast("Failed to save configuration");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 检查服务器是否已添加
  const isServerAdded = (id: string) => {
    return id in config.mcpServers;
  };

  // 加载当前编辑服务器的配置
  useEffect(() => {
    if (editingServerId) {
      const currentConfig = config.mcpServers[editingServerId];
      if (currentConfig) {
        // 从当前配置中提取用户配置
        const preset = presetServers.find((s) => s.id === editingServerId);
        if (preset?.configSchema) {
          const userConfig: Record<string, any> = {};
          Object.entries(preset.argsMapping || {}).forEach(([key, mapping]) => {
            if (mapping.type === "spread") {
              // 对于 spread 类型，从 args 中提取数组
              const startPos = mapping.position ?? 0;
              userConfig[key] = currentConfig.args.slice(startPos);
            } else if (mapping.type === "single") {
              // 对于 single 类型，获取单个值
              userConfig[key] = currentConfig.args[mapping.position ?? 0];
            } else if (
              mapping.type === "env" &&
              mapping.key &&
              currentConfig.env
            ) {
              // 对于 env 类型，从环境变量中获取值
              userConfig[key] = currentConfig.env[mapping.key];
            }
          });
          setUserConfig(userConfig);
        }
      } else {
        setUserConfig({});
      }
    }
  }, [editingServerId, config.mcpServers]);

  // 保存服务器配置
  const saveServerConfig = async () => {
    const preset = presetServers.find((s) => s.id === editingServerId);
    if (!preset || !preset.configSchema || !editingServerId) return;

    try {
      // 构建服务器配置
      const args = [...preset.baseArgs];
      const env: Record<string, string> = {};

      Object.entries(preset.argsMapping || {}).forEach(([key, mapping]) => {
        const value = userConfig[key];
        if (mapping.type === "spread" && Array.isArray(value)) {
          const pos = mapping.position ?? 0;
          args.splice(pos, 0, ...value);
        } else if (
          mapping.type === "single" &&
          mapping.position !== undefined
        ) {
          args[mapping.position] = value;
        } else if (
          mapping.type === "env" &&
          mapping.key &&
          typeof value === "string"
        ) {
          env[mapping.key] = value;
        }
      });

      const serverConfig: ServerConfig = {
        command: preset.command,
        args,
        ...(Object.keys(env).length > 0 ? { env } : {}),
      };

      // 更新配置
      const newConfig = {
        ...config,
        mcpServers: {
          ...config.mcpServers,
          [editingServerId]: serverConfig,
        },
      };

      await saveConfig(newConfig);
      setEditingServerId(undefined);
      showToast("Server configuration saved successfully");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to save configuration",
      );
    }
  };

  // 渲染配置表单
  const renderConfigForm = () => {
    const preset = presetServers.find((s) => s.id === editingServerId);
    if (!preset?.configSchema) return null;

    return Object.entries(preset.configSchema.properties).map(
      ([key, prop]: [string, ConfigProperty]) => {
        if (prop.type === "array") {
          const currentValue = userConfig[key as keyof typeof userConfig] || [];
          return (
            <ListItem key={key} title={key} subTitle={prop.description}>
              <div className={styles["path-list"]}>
                {(currentValue as string[]).map(
                  (value: string, index: number) => (
                    <div key={index} className={styles["path-item"]}>
                      <input
                        type="text"
                        value={value}
                        placeholder={`Path ${index + 1}`}
                        onChange={(e) => {
                          const newValue = [...currentValue] as string[];
                          newValue[index] = e.target.value;
                          setUserConfig({ ...userConfig, [key]: newValue });
                        }}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        className={styles["delete-button"]}
                        onClick={() => {
                          const newValue = [...currentValue] as string[];
                          newValue.splice(index, 1);
                          setUserConfig({ ...userConfig, [key]: newValue });
                        }}
                      />
                    </div>
                  ),
                )}
                <IconButton
                  icon={<AddIcon />}
                  text="Add Path"
                  className={styles["add-button"]}
                  bordered
                  onClick={() => {
                    const newValue = [...currentValue, ""] as string[];
                    setUserConfig({ ...userConfig, [key]: newValue });
                  }}
                />
              </div>
            </ListItem>
          );
        } else if (prop.type === "string") {
          const currentValue = userConfig[key as keyof typeof userConfig] || "";
          return (
            <ListItem key={key} title={key} subTitle={prop.description}>
              <div className={styles["input-item"]}>
                <input
                  type="text"
                  value={currentValue}
                  placeholder={`Enter ${key}`}
                  onChange={(e) => {
                    setUserConfig({ ...userConfig, [key]: e.target.value });
                  }}
                />
              </div>
            </ListItem>
          );
        }
        return null;
      },
    );
  };

  // 获取服务器的 Primitives
  const loadPrimitives = async (id: string) => {
    try {
      setIsLoading(true);
      const result = await getClientPrimitives(id);
      if (result) {
        setPrimitives(result);
      } else {
        showToast("Server is not running");
        setPrimitives([]);
      }
    } catch (error) {
      showToast("Failed to load primitives");
      console.error(error);
      setPrimitives([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 重启所有客户端
  const handleRestart = async () => {
    try {
      setIsLoading(true);
      await restartAllClients();
      await updateServerStatus();
      showToast("All clients restarted successfully");
    } catch (error) {
      showToast("Failed to restart clients");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加服务器
  const addServer = async (preset: PresetServer) => {
    if (!preset.configurable) {
      try {
        setIsLoading(true);
        showToast("Creating MCP client...");
        // 如果服务器不需要配置，直接添加
        const serverConfig: ServerConfig = {
          command: preset.command,
          args: [...preset.baseArgs],
        };
        const newConfig = {
          ...config,
          mcpServers: {
            ...config.mcpServers,
            [preset.id]: serverConfig,
          },
        };
        await saveConfig(newConfig);
      } finally {
        setIsLoading(false);
      }
    } else {
      // 如果需要配置，打开配置对话框
      setEditingServerId(preset.id);
      setUserConfig({});
    }
  };

  // 移除服务器
  const removeServer = async (id: string) => {
    try {
      setIsLoading(true);
      const { [id]: _, ...rest } = config.mcpServers;
      const newConfig = {
        ...config,
        mcpServers: rest,
      };
      await saveConfig(newConfig);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className={styles["mcp-market-page"]}>
        <div className="window-header">
          <div className="window-header-title">
            <div className="window-header-main-title">
              MCP Market
              {isLoading && (
                <span className={styles["loading-indicator"]}>Loading...</span>
              )}
            </div>
            <div className="window-header-sub-title">
              {Object.keys(config.mcpServers).length} servers configured
            </div>
          </div>

          <div className="window-actions">
            <div className="window-action-button">
              <IconButton
                icon={<RestartIcon />}
                bordered
                onClick={handleRestart}
                text="Restart"
                disabled={isLoading}
              />
            </div>
            <div className="window-action-button">
              <IconButton
                icon={<CloseIcon />}
                bordered
                onClick={() => navigate(-1)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className={styles["mcp-market-page-body"]}>
          <div className={styles["mcp-market-filter"]}>
            <input
              type="text"
              className={styles["search-bar"]}
              placeholder={"Search MCP Server"}
              autoFocus
              onInput={(e) => setSearchText(e.currentTarget.value)}
            />
          </div>

          <div className={styles["server-list"]}>
            {presetServers
              .filter(
                (m) =>
                  searchText.length === 0 ||
                  m.name.toLowerCase().includes(searchText.toLowerCase()) ||
                  m.description
                    .toLowerCase()
                    .includes(searchText.toLowerCase()),
              )
              .sort((a, b) => {
                const aAdded = isServerAdded(a.id);
                const bAdded = isServerAdded(b.id);
                const aError = clientErrors[a.id] !== null;
                const bError = clientErrors[b.id] !== null;

                if (aAdded !== bAdded) {
                  return aAdded ? -1 : 1;
                }
                if (aAdded && bAdded) {
                  if (aError !== bError) {
                    return aError ? -1 : 1;
                  }
                }
                return 0;
              })
              .map((server) => (
                <div
                  className={clsx(styles["mcp-market-item"], {
                    [styles["disabled"]]: isLoading,
                  })}
                  key={server.id}
                >
                  <div className={styles["mcp-market-header"]}>
                    <div className={styles["mcp-market-title"]}>
                      <div className={styles["mcp-market-name"]}>
                        {server.name}
                        {isServerAdded(server.id) && (
                          <span
                            className={clsx(styles["server-status"], {
                              [styles["error"]]:
                                clientErrors[server.id] !== null,
                            })}
                          >
                            {clientErrors[server.id] === null
                              ? "Active"
                              : "Error"}
                            {clientErrors[server.id] && (
                              <span className={styles["error-message"]}>
                                : {clientErrors[server.id]}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                      <div
                        className={clsx(styles["mcp-market-info"], "one-line")}
                      >
                        {server.description}
                      </div>
                    </div>
                  </div>
                  <div className={styles["mcp-market-actions"]}>
                    {isServerAdded(server.id) ? (
                      <>
                        {server.configurable && (
                          <IconButton
                            icon={<EditIcon />}
                            text="Configure"
                            className={clsx({
                              [styles["action-error"]]:
                                clientErrors[server.id] !== null,
                            })}
                            onClick={() => setEditingServerId(server.id)}
                            disabled={isLoading}
                          />
                        )}
                        {isServerAdded(server.id) && (
                          <IconButton
                            icon={<EyeIcon />}
                            text="Detail"
                            onClick={async () => {
                              if (clientErrors[server.id] !== null) {
                                showToast("Server is not running");
                                return;
                              }
                              setViewingServerId(server.id);
                              await loadPrimitives(server.id);
                            }}
                            disabled={isLoading}
                          />
                        )}
                        <IconButton
                          icon={<DeleteIcon />}
                          text="Remove"
                          className={styles["action-danger"]}
                          onClick={() => removeServer(server.id)}
                          disabled={isLoading}
                        />
                      </>
                    ) : (
                      <IconButton
                        icon={<AddIcon />}
                        text="Add"
                        className={styles["action-primary"]}
                        onClick={() => addServer(server)}
                        disabled={isLoading}
                      />
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {editingServerId && (
          <div className="modal-mask">
            <Modal
              title={`Configure Server - ${editingServerId}`}
              onClose={() => !isLoading && setEditingServerId(undefined)}
              actions={[
                <IconButton
                  key="cancel"
                  text="Cancel"
                  onClick={() => setEditingServerId(undefined)}
                  bordered
                  disabled={isLoading}
                />,
                <IconButton
                  key="confirm"
                  text="Save"
                  type="primary"
                  onClick={saveServerConfig}
                  bordered
                  disabled={isLoading}
                />,
              ]}
            >
              <List>{renderConfigForm()}</List>
            </Modal>
          </div>
        )}

        {viewingServerId && (
          <div className="modal-mask">
            <Modal
              title={`Server Details - ${viewingServerId}`}
              onClose={() => setViewingServerId(undefined)}
              actions={[
                <IconButton
                  key="close"
                  text="Close"
                  onClick={() => setViewingServerId(undefined)}
                  bordered
                />,
              ]}
            >
              <div className={styles["primitives-list"]}>
                {isLoading ? (
                  <div>Loading...</div>
                ) : primitives.filter((p) => p.type === "tool").length > 0 ? (
                  primitives
                    .filter((p) => p.type === "tool")
                    .map((primitive, index) => (
                      <div key={index} className={styles["primitive-item"]}>
                        <div className={styles["primitive-name"]}>
                          {primitive.value.name}
                        </div>
                        {primitive.value.description && (
                          <div className={styles["primitive-description"]}>
                            {primitive.value.description}
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div>No tools available</div>
                )}
              </div>
            </Modal>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
