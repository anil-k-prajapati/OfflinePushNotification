# Contributing to Offline Push Notification System

Thank you for your interest in contributing to this project! 🎉

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/OfflinePushNotification.git
   cd OfflinePushNotification
   ```
3. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/amazing-feature
   ```

## 🛠 Development Setup

1. **Prerequisites:**
   - .NET 8.0 SDK
   - MySQL Server 8.0+
   - Visual Studio 2022 or VS Code

2. **Database Setup:**
   ```bash
   mysql -u root -p < Database/setup.sql
   ```

3. **Configuration:**
   - Update connection string in `appsettings.json`
   - Set your MySQL password

4. **Run the application:**
   ```bash
   dotnet restore
   dotnet build
   dotnet run
   ```

## 📝 Contribution Guidelines

### Code Style
- Follow C# coding conventions
- Use meaningful variable and method names
- Add comments for complex logic
- Keep methods focused and small

### Database Changes
- Always use stored procedures (no inline SQL)
- Update `Database/setup.sql` with new procedures
- Test database changes thoroughly

### Frontend Changes
- Maintain responsive design
- Test on different browsers
- Keep JavaScript modular and documented

### Testing
- Test your changes thoroughly
- Verify both online and offline scenarios
- Check browser notifications work properly

## 🐛 Bug Reports

When reporting bugs, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS information
- Console errors (if any)

## 💡 Feature Requests

For new features:
- Describe the use case
- Explain why it would be valuable
- Consider backward compatibility
- Provide implementation ideas if possible

## 📋 Pull Request Process

1. **Update documentation** if needed
2. **Test your changes** thoroughly
3. **Write clear commit messages**:
   ```
   feat: add user groups for targeted notifications
   fix: resolve undefined notification properties
   docs: update setup instructions
   ```
4. **Create a pull request** with:
   - Clear title and description
   - Reference any related issues
   - Screenshots for UI changes

## 🎯 Areas for Contribution

- **Performance improvements**
- **Additional notification types**
- **Mobile responsiveness**
- **Accessibility features**
- **Documentation improvements**
- **Unit tests**
- **Docker support**
- **CI/CD pipeline**

## 💬 Questions?

Feel free to reach out:
- **Email:** [anil.personal.me@gmail.com](mailto:anil.personal.me@gmail.com)
- **GitHub Issues:** For technical questions
- **GitHub Discussions:** For general questions

## ☕ Support

If you find this project helpful, consider:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support%20Development-orange?style=for-the-badge&logo=buy-me-a-coffee)](https://buymeacoffee.com/anilperson9)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to make this project better for everyone!** 🙏
