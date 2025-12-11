import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { environment } from '../../../enviroments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  // Expose environment URLs for template
  apiDocsUrl = `${environment.apiUrl}/api`;
  coverageUrl = environment.production
    ? 'https://codecov.io/gh/Netexus/TechHelpDesk'
    : `${environment.apiUrl}/coverage/`;
  testResultsUrl = 'https://github.com/Netexus/TechHelpDesk/actions/workflows/test-coverage.yml';

  constructor(private authService: AuthService, private router: Router) {
    console.log('LoginComponent: Initialized');
  }

  login() {
    this.loading = true;
    this.error = '';
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = 'Invalid credentials';
        this.loading = false;
      }
    });
  }

  openTestReports() {
    const message = `Test Coverage & Results:

📊 Coverage Report (Codecov):
${this.coverageUrl}

✅ Test Results (GitHub Actions):
${this.testResultsUrl}

📚 API Documentation (Swagger):
${this.apiDocsUrl}

Note: 
- Coverage shows which lines of code are tested
- GitHub Actions shows pass/fail results of all tests
- Swagger provides interactive API documentation`;

    alert(message);

    // Open Codecov in new tab
    window.open(this.coverageUrl, '_blank');
  }
}
