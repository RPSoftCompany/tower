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
    it('Go to Zone', () => {
        cy.get('[data-cy=menuBase-Zone]').click()
    })
    it('Add Zone', () => {
        cy.get('.v-input__prepend-outer').should('be.visible')
        cy.get('[data-cy=modelSelectInput_Zone]').should('be.visible')
        cy.get('[role=progressbar]').should('not.be.visible')
        cy.get('[data-cy=modelSelectInput_Zone]').type('EMEA')
        cy.get('[data-cy=modelSelectParent_Zone]').within(() => {
            cy.get('.v-input__append-outer > .v-input__icon > button').should('be.visible')
            cy.get('.v-input__append-outer > .v-input__icon > button').click()
        })

        cy.get('[data-cy=modelPane]').should('be.visible')
    })
    it('Add Rule', () => {
        cy.get('[data-cy=newRuleTargetText]').type('test')
        cy.get('[data-cy=newRuleConditionText]').type('test')
        cy.get('[data-cy=newRuleError]').type('test')

        cy.get('[data-cy=newRuleErrorParent]').within(() => {
            cy.get('.v-input__append-outer > .v-input__icon > button').should('be.visible')
            cy.get('.v-input__append-outer > .v-input__icon > button').click()
        })

        cy.get('[data-cy=targetTexttest]').should('be.visible')
    })
    it('Remove Zone', () => {
        cy.get('[data-cy=modelSelectParent_Zone]').within(() => {
            cy.get('.v-input__append-outer > .v-input__icon > button').should('be.visible')
            cy.get('.v-input__append-outer > .v-input__icon > button').click()
        })

        cy.get('[data-cy=deleteYes]').click()

        cy.get('[data-cy=deleteDialog]').should('not.be.visible')
    })
    it('Add Zone (Again)', () => {
        cy.get('.v-input__prepend-outer').should('be.visible')
        cy.get('[role=progressbar]').should('not.be.visible')
        cy.get('[data-cy=modelSelectInput_Zone]').type('EMEA')
        cy.get('[data-cy=modelSelectParent_Zone]').within(() => {
            cy.get('.v-input__append-outer > .v-input__icon > button').should('be.visible')
            cy.get('.v-input__append-outer > .v-input__icon > button').click()
        })

        cy.get('[data-cy=modelPane]').should('be.visible')
    })
    it('Go to Environment', () => {
        cy.get('[data-cy=menuBase-Environment]').click()
    })
    it('Add Environment', () => {
        cy.get('.v-input__prepend-outer').should('be.visible')
        cy.get('[data-cy=modelSelectInput_Environment]').should('be.visible')
        cy.get('[role=progressbar]').should('not.be.visible')
        cy.get('[data-cy=modelSelectInput_Environment]').type('DEV')
        cy.get('[data-cy=modelSelectParent_Environment]').within(() => {
            cy.get('.v-input__append-outer > .v-input__icon > button').should('be.visible')
            cy.get('[role=progressbar]').should('not.be.visible')
            cy.get('.v-input__append-outer > .v-input__icon > button').click()
        })

        cy.get('[data-cy=modelPane]').should('be.visible')
    })
    it('Go to Application', () => {
        cy.get('[data-cy=menuBase-Application]').click()
    })
    it('Add Application', () => {
        cy.get('.v-input__prepend-outer').should('be.visible')
        cy.get('[data-cy=modelSelectInput_Application]').should('be.visible')
        cy.get('[role=progressbar]').should('not.be.visible')
        cy.get('[data-cy=modelSelectInput_Application]').type('A')
        cy.get('[data-cy=modelSelectParent_Application]').within(() => {
            cy.get('.v-input__append-outer > .v-input__icon > button').should('be.visible')
            cy.get('.v-input__append-outer > .v-input__icon > button').click()
        })

        cy.get('[data-cy=modelPane]').should('be.visible')
    })
})
