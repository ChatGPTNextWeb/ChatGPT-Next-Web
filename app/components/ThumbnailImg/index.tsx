import ImgDeleteIcon from "@/app/icons/imgDeleteIcon.svg";

export interface ThumbnailProps {
  image: string;
  deleteImage: () => void;
}

export default function Thumbnail(props: ThumbnailProps) {
  const { image, deleteImage } = props;
  return (
    <div
      className={` h-thumbnail w-thumbnail cursor-default border border-thumbnail rounded-action-btn flex-0 bg-cover bg-center`}
      style={{ backgroundImage: `url("${image}")` }}
    >
      <div
        className={` w-[100%] h-[100%] opacity-0 transition-all duration-200 rounded-action-btn hover:opacity-100 hover:bg-thumbnail-mask`}
      >
        <div
          className={`cursor-pointer flex items-center justify-center float-right`}
          onClick={deleteImage}
        >
          <ImgDeleteIcon />
        </div>
      </div>
    </div>
  );
}
