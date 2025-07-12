# Resend.com Email Integration with Handlebars Templates

This document explains the integration of Resend.com for sending emails in the REO Limited Backend project using existing Handlebars templates.

## Changes Made

### 1. Package Installation
- Added `resend` package to the project dependencies
- Added `handlebars` package for template processing
- Run: `npm install resend handlebars`

### 2. Mail Service Updates
- **File**: `src/usecase/services/mail/mail.service.ts`
- Commented out the old `sendMail` function that used axios to call an external mail server
- Created a new `sendMail` function using Resend.com SDK
- Added template caching for better performance
- Updated `generateEmailHTML` method to load and compile Handlebars templates from `templets` folder

### 3. Environment Configuration
- **File**: `config.env`
- Added `RESEND_FROM_EMAIL` configuration
- `RESEND_API_KEY` was already configured

## Configuration

### Environment Variables
```env
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Getting Resend API Key
1. Sign up at [resend.com](https://resend.com)
2. Go to your dashboard
3. Navigate to API Keys section
4. Create a new API key
5. Add the key to your `config.env` file

### Domain Verification
1. In your Resend dashboard, add and verify your domain
2. Update the `RESEND_FROM_EMAIL` to use your verified domain

## Template System

### Available Templates
The system uses existing Handlebars templates from the `templets` folder:

- **qrcode.hbs**: QR code emails with survey links
- **certificate.hbs**: Certificate completion emails  
- **adduserassessment.hbs**: Assessment invitation emails
- **assessment.hbs**: Assessment details emails
- **main-mail.hbs**: General notification emails
- **master-trainer.hbs**: Training notification emails
- **assessmentcreate.hbs**: Assessment creation emails
- **browserotp.hbs**: Browser OTP emails
- **email.hbs**: General email template
- **impact-invitation.hbs**: Impact invitation emails
- **report-templet.hbs**: Report template emails
- **sessionCreate.hbs**: Session creation emails
- **updateNotifaication.hbs**: Update notification emails
- **accountdeactive.hbs**: Account deactivation emails

### Template Variables
Templates use Handlebars syntax with variables like:
- `{{heading}}` - Email heading
- `{{text}}` - Main content text
- `{{subject}}` - Email subject
- `{{title}}` - Email title
- `{{message}}` - Email message
- `{{email}}` - Recipient email
- `{{surveyUrl}}` - Survey URL
- `{{url}}` - General URL
- `{{startDate}}` - Start date
- `{{endDate}}` - End date
- `{{trainingDate}}` - Training date
- `{{programTitle}}` - Program title
- `{{programDescription}}` - Program description

### Template Features
- **Professional Design**: All templates have consistent branding and styling
- **RTL Support**: Arabic text support with proper RTL layout
- **Responsive Design**: Mobile-friendly email templates
- **Custom Fonts**: Uses SST-Arabic-Roman font family
- **Background Images**: Professional background styling
- **Dynamic Content**: Context variables for personalized emails

## Usage

The `sendMail` function maintains the same interface as before:

```typescript
this.sendMail({
    email: 'user@example.com',
    subject: 'Email Subject',
    template: 'qrcode', // Will load templets/qrcode.hbs
    context: {
        heading: 'شكراً لك',
        text: 'QR code URL',
        email: 'user@example.com',
        surveyUrl: 'https://example.com/survey'
    }
});
```

### Template Loading
- Templates are loaded from the `templets` folder
- Template names should match the `.hbs` file names (without extension)
- Templates are cached for better performance
- If a template is not found, a fallback error template is used

## Benefits of This Integration

1. **Existing Templates**: Uses your existing professional email templates
2. **No Template Recreation**: No need to recreate templates in code
3. **Template Caching**: Improved performance with template caching
4. **Easy Maintenance**: Templates can be updated without code changes
5. **Consistent Branding**: Maintains your existing email design
6. **Reliability**: Resend provides high deliverability rates
7. **Analytics**: Built-in email analytics and tracking
8. **Scalability**: Handles high-volume email sending

## Migration Notes

- The old `sendMail` function is commented out but preserved for reference
- All existing email functionality continues to work with the new implementation
- No changes required in other parts of the application
- Email logging functionality is preserved
- Template loading is automatic and transparent

## Testing

To test the email functionality:

1. Ensure your Resend API key is valid
2. Verify your domain in Resend dashboard
3. Send a test email using any of the existing email methods
4. Check the mail logs for success/error status
5. Verify that templates are loading correctly

## Troubleshooting

### Common Issues

1. **Template Not Found**: Ensure the template file exists in `templets` folder
2. **API Key Invalid**: Ensure your Resend API key is correct
3. **Domain Not Verified**: Verify your domain in Resend dashboard
4. **Email Not Sending**: Check the console logs for error messages
5. **Template Variables**: Ensure all required variables are provided in context

### Debug Mode
The service logs detailed information about email sending:
- Success: "Email sent successfully to: [email]"
- Template errors: Detailed error information in console
- Mail logs: Success/error status in database

### Template Development
To add new templates:
1. Create a new `.hbs` file in the `templets` folder
2. Use Handlebars syntax for dynamic content
3. Test the template with sample data
4. The template will be automatically available for use 