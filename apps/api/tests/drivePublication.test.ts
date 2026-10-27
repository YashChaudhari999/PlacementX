import { buildDriveUrl } from '../src/services/drive-publication.service';
import { renderDrivePublicationEmail } from '../src/services/email/templates/drivePublication.template';

describe('drive publication links and email', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('builds a stable drive URL from configured frontend origin', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      FRONTEND_URL: 'https://placementx.example/',
    };
    expect(buildDriveUrl('drive-123')).toBe('https://placementx.example/drives/drive-123');
  });

  it('rejects insecure production origins', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      FRONTEND_URL: 'http://placementx.example',
    };
    expect(() => buildDriveUrl('drive-123')).toThrow('HTTPS');
  });

  it('renders drive data in HTML and text while escaping untrusted fields', () => {
    const result = renderDrivePublicationEmail({
      studentName: '<Student>',
      driveTitle: 'Graduate Engineer',
      companyName: 'Example & Co',
      jobRole: 'Engineer',
      fixedSalary: 12,
      deadline: new Date('2026-12-01T12:00:00.000Z'),
      driveUrl: 'https://placementx.example/drives/drive-123',
    });

    expect(result.html).toContain('&lt;Student&gt;');
    expect(result.html).toContain('Example &amp; Co');
    expect(result.html).toContain('12 LPA');
    expect(result.html).toContain('View Placement Drive');
    expect(result.text).toContain('https://placementx.example/drives/drive-123');
  });
});
