import React from "react";

interface Props {
  title: string;
  message: string;
  onClose: () => void;
}

const Modal: React.FC<Props> = ({ title, message, onClose }) => {
  return (
    <div className="modal">
      <div className="modal__content">
        <h2 className="modal__title">{title}</h2>
        <p className="modal__message">{message}</p>
        <button className="modal__button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
