export default function PageHeading({ title, description, action }) {
  return (
    <section className="page-heading">
      <div>
        <span className="carepass-badge">Digitalni pasoš kompetencija</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </section>
  );
}
