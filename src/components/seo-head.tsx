type SeoHeadProps = {
  page: string;
};

export function SeoHead({ page }: SeoHeadProps) {
  const title = `Martin Christiansen - ${page.charAt(0).toUpperCase() + page.slice(1)}`;

  return (
    <head>
      <title>{title}</title>
      <meta name="description" content="Martin Christiansen - Software Developer" />
    </head>
  );
}
