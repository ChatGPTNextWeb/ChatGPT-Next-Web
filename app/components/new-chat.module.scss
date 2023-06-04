@import "../styles/animation.scss";

.new-chat {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .mask-header {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    animation: slide-in-from-top ease 0.3s;
  }

  .mask-cards {
    display: flex;
    margin-top: 5vh;
    margin-bottom: 20px;
    animation: slide-in ease 0.3s;

    .mask-card {
      padding: 20px 10px;
      border: var(--border-in-light);
      box-shadow: var(--card-shadow);
      border-radius: 14px;
      background-color: var(--white);
      transform: scale(1);

      &:first-child {
        transform: rotate(-15deg) translateY(5px);
      }

      &:last-child {
        transform: rotate(15deg) translateY(5px);
      }
    }
  }

  .title {
    font-size: 32px;
    font-weight: bolder;
    margin-bottom: 1vh;
    animation: slide-in ease 0.35s;
  }

  .sub-title {
    animation: slide-in ease 0.4s;
  }

  .actions {
    margin-top: 5vh;
    margin-bottom: 2vh;
    animation: slide-in ease 0.45s;
    display: flex;
    justify-content: center;
    font-size: 12px;

    .skip {
      margin-left: 10px;
    }
  }

  .masks {
    flex-grow: 1;
    width: 100%;
    overflow: auto;
    align-items: center;
    padding-top: 20px;

    $linear: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 1),
      rgba(0, 0, 0, 0)
    );

    -webkit-mask-image: $linear;
    mask-image: $linear;

    animation: slide-in ease 0.5s;

    .mask-row {
      display: flex;
      // justify-content: center;
      margin-bottom: 10px;

      @for $i from 1 to 10 {
        &:nth-child(#{$i * 2}) {
          margin-left: 50px;
        }
      }

      .mask {
        display: flex;
        align-items: center;
        padding: 10px 14px;
        border: var(--border-in-light);
        box-shadow: var(--card-shadow);
        background-color: var(--white);
        border-radius: 10px;
        margin-right: 10px;
        max-width: 8em;
        transform: scale(1);
        cursor: pointer;
        transition: all ease 0.3s;

        &:hover {
          transform: translateY(-5px) scale(1.1);
          z-index: 999;
          border-color: var(--primary);
        }

        .mask-name {
          margin-left: 10px;
          font-size: 14px;
        }
      }
    }
  }
}
