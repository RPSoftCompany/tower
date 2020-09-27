describe('Login', () => {
    afterEach(function () {
        if (this.currentTest.state === 'failed') {
          Cypress.runner.stop()
        }
    })
    it('Login', () => {
        cy.visit('/')

        cy.get('[data-cy=login]').type('admin')
        cy.get('[data-cy=password]').type('admin')

        cy.get('[data-cy=loginButton]').click()
    })
    it('Go to base models', () => {
        cy.get('[data-cy=baseModel]').click()
    })
    it('Create model', () => {
        cy.get('[data-cy=newBase]').type('newbase{enter}')
        cy.get('[data-cy=handler]').children().should('have.length', 1)
    })
    it('Remove all models', () => {
        cy.get('[data-cy*="removeBase"]').each(($el) => {
            cy.wrap($el).click()
        })
        cy.get('[data-cy=handler]').children().should('have.length', 0)
    })
    it('Create 3 models', () => {
        cy.get('[data-cy=newBase]').type('Zone{enter}')
        cy.get('[data-cy=handler]').children().should('have.length', 1)
        cy.get('[data-cy=newBase]').type('Environment{enter}')
        cy.get('[data-cy=handler]').children().should('have.length', 2)
        cy.get('[data-cy=newBase]').type('Application{enter}')
        cy.get('[data-cy=handler]').children().should('have.length', 3)
    })
})
