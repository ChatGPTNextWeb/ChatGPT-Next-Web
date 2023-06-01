const openPopup = (url: string, target: string) => {
  const link = document.createElement("a");

  link.href = url;
  link.target = target;

  const event = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  link.dispatchEvent(event);
};

export default openPopup;
