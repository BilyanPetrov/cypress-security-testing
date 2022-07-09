describe('sql injection attack', () => {

    beforeEach(() => {
        cy.log(`Navigating and performing SQL Injection attacks on Car Parts project.`)
        cy.visit('http://localhost:3000')
    })

    it('should not display sensitive information when email input form is SQL injected', () => {
        // Navigate to login form
        cy.contains('Вход')
            .click({ force: true })
        
        // Assert login form is visible
        cy.get(`form[name='memberLoginForm']`)
            .should('be.visible')
        
        // Get malicious payloads fixture
        cy.fixture('sql-malicious-payloads')
            .then(payloads => {
                payloads['email-input'].forEach(payloadItem => {
                    cy.scrollTo('top')
                    // Enter malicious payload into email field
                    cy.get("div.member-form input[name='email']")
                        .should('be.visible')
                        .clear()
                        .type(payloadItem, { force: true })
                    
                    // Enter any password into password field
                    cy.get("div.member-form input[name='password']")
                        .should('be.visible')
                        .clear()
                        .type("anyPass{!#", { force: true, delay: 30 })
                    
                    cy.scrollTo('top')
                    // Click Login button
                    cy.get("div.login-btn")
                        .find("button[type='submit']")
                        .click({ force: true })

                    // Assert error msg is displayed for invalid email!
                    cy.contains("Невалиден мейл!")
                        .scrollIntoView()
                        .should('be.visible')
                    
                    // Make sure no 'isAdmin' containing text is displayed in the user browser
                    cy.contains("isAdmin")
                        .should('not.exist')

                    // Make sure no 'password' containing text is displayed in the user browser
                    cy.contains('password')
                        .should('not.exist')

                    // Make sure no 'orders' containing text is displayed in the user browser
                    cy.contains("orders")
                        .should('not.exist')

                    assertNoMaliciousContentOnPage()
                })
            })
    })

    it('should not display any sensitive information to the user on "Sell your car" page when SQL injected', () => {
        cy.get(".redemption-car")
            .should('be.visible')
            .click({ force: true })

        cy.get(".button-evaluation")
            .should('be.visible')
            .click({ force: true })

        cy.fixture('sql-malicious-payloads')
            .then(payloads => {
                // Fill in form with malicious SQL payload
                typeMaliciousDataToElement("form[name=\"buyoutForm\"] input[name=\"brand\"]", payloads['get-all-users'])
                typeMaliciousDataToElement("form[name=\"buyoutForm\"] input[name=\"model\"]", payloads['zero-division'])
                typeMaliciousDataToElement("form[name=\"buyoutForm\"] input[name=\"manufactureYear\"]", payloads['expect-error-0'])
                typeMaliciousDataToElement("form[name=\"buyoutForm\"] input[name=\"engineType\"]", payloads['expect-error-1'])
                typeMaliciousDataToElement("form[name=\"buyoutForm\"] input[name=\"gearboxType\"]", payloads['no-sql-node-query'])
                
                // This input element doesn't allow strings, only numbers
                cy.get("form[name=\"buyoutForm\"] input[name=\"priceWanted\"]")
                    .scrollIntoView()
                    .clear({ force: true })
                    .type(150000, { force: true })
                
                cy.scrollTo('top')

                typeMaliciousDataToElement("form[name=\"buyoutForm\"] textarea", payloads['no-sql-always-true-8'])

                cy.scrollTo('top')

                cy.get("form[name=\"buyoutForm\"] button[type='submit']")
                    .scrollIntoView()
                    .click({ force: true })
                
                    cy.scrollTo('top')
                assertNoMaliciousContentOnPage()

                typeMaliciousDataToElement("input[name=\"imageUrl\"]", payloads['no-sql-always-true-1'])
                cy.scrollTo('top')
                cy.get('button[type="submit"]')
                    .first()
                    .should('be.visible')
                    .click({ force: true })

                cy.scrollTo('top')
                assertNoMaliciousContentOnPage()
            })
    })
})

function assertNoMaliciousContentOnPage() {
    // Make sure no unexpected-output string is displayed as well.
    cy.fixture('sql-unexpected-output')
    .then(unexpectedOutputArr => {
        unexpectedOutputArr.forEach(unexpectedOutput => {
            cy.contains(unexpectedOutput)
                .should('not.exist')
        })
    })
}

function typeMaliciousDataToElement(elementLocator, dataToType) {
    return cy.get(elementLocator)
        .scrollIntoView()
        .clear({ force: true })
        .type(dataToType, { force: true, parseSpecialCharSequences: false })
}