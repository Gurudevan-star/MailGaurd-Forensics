# MailGuard Forensics extension

This Chrome/Edge extension checks the visible message body in Gmail and Outlook Web for explainable phishing signals. When it finds signals, it shows a warning overlay. The recipient can review the message carefully or dismiss the warning and continue.

## Install and test

1. Extract the ZIP file.
2. In Chrome, open `chrome://extensions` (or `edge://extensions` in Edge).
3. Enable **Developer mode** and select **Load unpacked**.
4. Choose the extracted `mailguard-forensics-extension` folder.
5. Open Gmail or Outlook on the web and open an email.

For a simple demonstration, send yourself an email such as:

> Urgent: your account is suspended. Verify your account within 24 hours at http://example.com/login and share your OTP.

The extension should show a warning and explain the detected signals. It only scans the email currently visible in the browser and does not send message content anywhere.

## Important limitation

This is a subject-project prototype, not a replacement for enterprise email security. It uses local pattern matching; a production version should add sender authentication analysis, domain reputation, attachment scanning, and carefully designed privacy protections.
