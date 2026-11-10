interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
  <div className="page-header">
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
    {actions && <div className="page-actions">{actions}</div>}
  </div>
);
