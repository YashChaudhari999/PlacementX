describe('EmailService Brevo delivery', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      BREVO_API_KEY: 'test-key',
      EMAIL_FROM: 'placementx.support@gmail.com',
      EMAIL_FROM_NAME: 'PlacementX Support',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('sends the OTP through the Brevo HTTPS API without exposing the key or OTP in headers', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 201 }));
    const { EmailService } = await import('../src/services/email/email.service');

    await expect(new EmailService().sendPasswordResetOtp({
      to: 'student@nmims.in',
      otp: '123456',
      displayName: 'Student',
    })).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.brevo.com/v3/smtp/email',
      expect.objectContaining({
        method: 'POST',
        headers: { 'api-key': 'test-key', 'content-type': 'application/json' },
      }),
    );
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(request.body as string)).toEqual(expect.objectContaining({
      sender: { name: 'PlacementX Support', email: 'placementx.support@gmail.com' },
      to: [{ email: 'student@nmims.in' }],
      subject: 'Your PlacementX password reset code',
    }));
  });
});
