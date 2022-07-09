const registerFormLocator = "form[name=\"memberLoginForm\"]";

describe('xss injection attack', () => {

    beforeEach(() => {
        cy.log(`Navigating and performing XSS attacks on Car Parts project.`)
        cy.visit('http://localhost:3000')
    })

    it('page should not execute malicious code when email input form is XSS injected', () => {
        // Navigate to login form
        cy.contains('Вход')
            .click({ force: true })

        // Assert login form is visible
        cy.get(`form[name='memberLoginForm']`)
            .should('be.visible')

        // Get malicious payloads fixture
        cy.fixture('xss-malicious-payloads')
            .then(payloads => {
                payloads.forEach(maliciousXssCode => {
                    cy.scrollTo('top')
                    // Enter malicious payload into email field
                    cy.get("div.member-form input[name='email']")
                        .should('be.visible')
                        .clear()
                        .type(maliciousXssCode, { force: true })

                    // Enter any password into password field
                    cy.get("div.member-form input[name='password']")
                        .should('be.visible')
                        .clear()
                        .type("anyPass{!#", { force: true, delay: 50 })

                    // Click Login button
                    cy.get("div.login-btn")
                        .find("button[type='submit']")
                        .click({ force: true })
                    cy.scrollTo('top')

                    assertNotXssVulnerable(maliciousXssCode);

                    // Assert error msg is displayed for invalid email!
                    cy.contains("Невалиден мейл!")
                        .scrollIntoView()
                        .should('be.visible')
                })
            })
    })

    it('register form is not vulnerable to XSS attacks', () => {
        cy.log('Navigating to register form.')
        cy.visit('http://localhost:3000/register');

        cy.get(registerFormLocator)
            .should('be.visible')

        cy.fixture('register-form-xss-payload')
            .then(registerFormXssPayload => {

                fillInRegisterFormDetails(
                    registerFormXssPayload['firstTest'][0], registerFormXssPayload['firstTest'][1],
                    registerFormXssPayload['firstTest'][2], registerFormXssPayload['firstTest'][3]
                );
                submitRegisterForm();
                assertNotXssVulnerable(`Either one: '${registerFormXssPayload['firstTest'][0]}', '${registerFormXssPayload['firstTest'][1]}',
                '${registerFormXssPayload['firstTest'][2]}', '${registerFormXssPayload['firstTest'][3]}'`);
                assertEmailNotValid();

                fillInRegisterFormDetails(
                    registerFormXssPayload['secondTest'][0], registerFormXssPayload['secondTest'][1],
                    registerFormXssPayload['secondTest'][2], registerFormXssPayload['secondTest'][3]
                );
                submitRegisterForm();
                assertNotXssVulnerable(`Either one: '${registerFormXssPayload['secondTest'][0]}', '${registerFormXssPayload['secondTest'][1]}',
                '${registerFormXssPayload['secondTest'][2]}', '${registerFormXssPayload['secondTest'][3]}'`);
                assertEmailNotValid();

                fillInRegisterFormDetails(
                    registerFormXssPayload['thirdTest'][0], registerFormXssPayload['thirdTest'][1],
                    registerFormXssPayload['thirdTest'][2], registerFormXssPayload['thirdTest'][3]
                );
                submitRegisterForm();
                assertNotXssVulnerable(`Either one: '${registerFormXssPayload['thirdTest'][0]}', '${registerFormXssPayload['thirdTest'][1]}',
                '${registerFormXssPayload['thirdTest'][2]}', '${registerFormXssPayload['thirdTest'][3]}'`);
                assertEmailNotValid();
            })
    })
})

function fillInRegisterFormDetails(name, email, number, pass) {
    let nameLocator = registerFormLocator + ` input[name="name"]`;
    let emailLocator = registerFormLocator + ` input[name="email"]`;
    let phoneLocator = registerFormLocator + ` input[name="telNumber"]`;
    let passwordLocator = registerFormLocator + ` input[name="password"]`;
    let reEnterPassLocator = registerFormLocator + ` input[name="repeatPass"]`;
    let agreementsLocator = registerFormLocator + ` input[type="checkbox"]`;

    cy.get(nameLocator)
        .clear({ force: true })
        .type(name, { force: true })

    cy.get(emailLocator)
        .clear({ force: true })
        .type(email, { force: true })

    cy.get(phoneLocator)
        .clear({ force: true })
        .type(number, { force: true })

    cy.get(passwordLocator)
        .clear({ force: true })
        .type(pass, { force: true })

    cy.get(reEnterPassLocator)
        .clear({ force: true })
        .type(pass, { force: true })

    cy.get(agreementsLocator)
        .each(agreementCheckBox => {
            cy.wrap(agreementCheckBox)
                .check({ force: true })
        })
}

function submitRegisterForm() {
    let registerBtnLocator = registerFormLocator + ` button[type="submit"]`;

    cy.get(registerBtnLocator)
        .click({ force: true })
}

function assertEmailNotValid() {
    cy.contains(`User validation failed: email: Please fill a valid email address`)
        .scrollIntoView()
        .should('be.visible')
}

function assertNotXssVulnerable(maliciousXssCode) {
    cy.on('window:alert', (text) => {
        throw new Error(`Application opened an alert! XSS attack successful with xss payload: '${maliciousXssCode}', alert text: '${text}'`);
    })
}