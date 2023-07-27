import React, { useState } from "react";

const CollapsibleElement: ({ message }: { message: any }) => JSX.Element = ({
  message,
}) => {
  return (
    <div>
      {message.map(
        (
          doc: {
            pageContent:
              | string
              | number
              | boolean
              | React.ReactElement<
                  any,
                  string | React.JSXElementConstructor<any>
                >
              | React.ReactFragment
              | React.ReactPortal
              | null
              | undefined;
            metadata: {
              source: string;
            };
          },
          index: React.Key,
        ) => {
          const sourceParts = doc.metadata.source.split("/"); // 假设文件路径中使用的是斜杠“/”
          const lastFolderName = sourceParts[sourceParts.length - 1]; // 获取最后一个文件夹名

          return (
            <div key={index}>
              <div>
                <h2>Page Content:</h2>
                <p>{doc.pageContent}</p>
                <h2>Source:</h2>
                <p>{lastFolderName}</p> {/* 显示最后一个文件夹名 */}
              </div>
            </div>
          );
        },
      )}
    </div>
  );
};

export default CollapsibleElement;
