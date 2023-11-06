import React from "react";
import "./ContactPopup.scss";
import Image from "next/image";

interface ContactPopupProps {
  onClose: () => void; // 添加关闭函数作为属性
}

const ContactPopup: React.FC<ContactPopupProps> = ({ onClose }) => {
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 如果点击事件的目标是 .popupBackground 元素，则关闭弹窗
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="popupBackground" onClick={handleBackgroundClick}>
      <div className="popup">
        <button className="closeButton" onClick={onClose}>
          &times;
        </button>{" "}
        {/* 这里使用 HTML 实体来代表 "X" */}
        <h2>联系我们</h2>
        <hr />
        <p className="description">
          {" "}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;制作之路充满挑战，每一步都凝聚了我们的心血与汗水。由于4.0APIKey—token是3.5的40倍。目前仅支持3.5，如果您想体验Chatgpt4更复杂的功能，可以与我们联系。
          ，让我们持续为您带来更优质的服务。。
        </p>{" "}
        {/* 添加描述 */}
        <p className="description" style={{ color: "red" }}>
          ⭐ &nbsp;&nbsp;&nbsp;&nbsp; ChatGpt PLUS 独享成品账号
          [&nbsp;&nbsp;可改密，实卡充值，稳定精品]
          非共享号，正规渠道，一卡一充，可改密码！
        </p>{" "}
        {/* 添加描述 */}
        <p className="description" style={{ color: "red" }}>
          ⭐ &nbsp;&nbsp;&nbsp;&nbsp; 提供企业级专业稳定的 ChatGPT
          接口集成分发服务：提供无限调用 ChatGPT API 的账号池，🔑
          支持模型：gpt-3.5-turbo | gpt-3.5-turbo-0613 | gpt-3.5-turbo-16k |
          gpt-3.5-turbo-16k-0613gpt-4 | gpt-4-0613
          （你可以开发自己的chatGpt，不再每个月续费账号）
        </p>{" "}
        {/* 添加描述 */}
        <p className="description" style={{ color: "red" }}>
          ⭐ &nbsp;&nbsp;&nbsp;&nbsp; 数字人 独享账号 生成数字人视频 无需充值
          直接使用（可做抖音短视频）
        </p>{" "}
        {/* 添加描述 */}
        <p className="description">
          <a href="http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=zXnwSsUDDlKsuiRobIeAeu1ZK1OvQBh_&authKey=SPzFZ55eMhrQ8iizyGjQwslQcNcUGocwcIbB3pQNBpvD7obvq43ldrDiBpRFHD4m&noverify=0&group_code=948777442">
            点击加入QQ群：948777442
          </a>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <a href="https://t.me/+ssknFhdb83Q2YmZl">点击加入TG群</a>
        </p>{" "}
        {/* 添加描述 */}
        <hr />
        <h3>捐赠（自愿）</h3>
        若您觉得满意并愿意支持，欢迎为我们打赏
        <div className="images">
          <img
            src="http://qn.jiashiyao.love/upic/2023/11/01/19/3pOkgC.jpg"
            alt="微信收款码"
          />
          <img
            src="http://qn.jiashiyao.love/upic/2023/11/01/19/miKCYK.jpg"
            alt="支付宝收款码"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactPopup;
