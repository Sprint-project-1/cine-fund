export default function PageHeading({ eyebrow, title, description, id }) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold tracking-[0.12em] text-primary">
        {eyebrow}
      </p>
      <h1
        id={id}
        className="m-0 text-4xl font-bold leading-[1.12] tracking-[-0.045em] text-[#161a22] max-[620px]:text-[32px]"
      >
        {title}
      </h1>
      <p className="mt-3 mb-0 text-[15px] leading-[1.5] text-[#697180]">
        {description}
      </p>
    </div>
  );
}
