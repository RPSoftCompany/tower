describe('Login', () => {
    it('Login', () => {
        cy.visit('/')

        cy.get('[data-cy=login]').type('admin')
        cy.get('[data-cy=password]').type('admin')

        cy.get('[data-cy=loginButton]').click()

        cy.url().should('include', '/settings')
    })
    it('Logout', () => {
        cy.get('[data-cy=profileButton]').click()
        cy.get('[data-cy=logoutButton]').click()

        cy.url().should('include', '/login')
    })
})
