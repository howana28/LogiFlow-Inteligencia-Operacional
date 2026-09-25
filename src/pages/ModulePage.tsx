interface ModulePageProps {
  eyebrow: string
  title: string
  description: string
}

export function ModulePage({
  eyebrow,
  title,
  description,
}: ModulePageProps) {
  return (
    <section className="module-page">
      <div className="page-heading">
        <span className="page-eyebrow">{eyebrow}</span>

        <h1>{title}</h1>

        <p className="page-description">
          {description}
        </p>
      </div>

      <div className="placeholder-card">
        <div className="placeholder-tag">
          Estrutura preparada
        </div>

        <strong>{title}</strong>

        <span>
          Esta etapa já faz parte da navegação definitiva do sistema.
          Os dados fictícios, ações e componentes funcionais serão
          adicionados nas próximas evoluções.
        </span>
      </div>
    </section>
  )
}