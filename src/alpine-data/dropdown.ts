export default () => ({
  show: false,
  timer: 0,
  open: function () {
    if (this.timer) {
      window.clearTimeout(this.timer);
    }
    this.show = true;
  },
  close: function () {
    this.timer = window.setTimeout(() => (this.show = false), 300);
  },
});
