type TestMessage = string | { id?: string; message?: string };

function mockTranslate(message: TestMessage, values?: Record<string, unknown>): string {
  const template = typeof message === 'string' ? message : (message.message ?? message.id ?? '');

  if (!values) {
    return template;
  }

  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

jest.mock('@lingui/react', () => ({
  I18nProvider: ({ children }: { children: unknown }) => children,
  useLingui: () => ({
    _: mockTranslate,
    i18n: { _: mockTranslate, locale: 'en' },
  }),
}));
