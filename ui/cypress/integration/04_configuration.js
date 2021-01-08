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
    it('Go to Configuration', () => {
        cy.get('[data-cy=configuration-Configuration]').click()

        cy.get('[data-cy=configuration_base_Zone]').should('be.visible')
    })
    it('Choose bases', () => {
        cy.get('[data-cy=configuration_base_Zone]').type('EMEA')
        cy.get('.v-menu__content').should('be.visible')
        cy.get('[role=progressbar]').should('not.be.visible')
        cy.get('[data-cy=configuration_base_Zone]').type('{enter}')

        cy.get('[data-cy=configuration_base_Environment]').type('DEV')
        cy.get('.v-menu__content').should('be.visible')
        cy.get('[role=progressbar]').should('not.be.visible')
        cy.get('[data-cy=configuration_base_Environment]').type('{enter}')

        cy.get('[data-cy=configuration_base_Application]').type('A')
        cy.get('[role=progressbar]').should('not.be.visible')
        cy.get('.v-menu__content').should('be.visible')
        cy.get('[data-cy=configuration_base_Application]').type('{enter}')
    })
    it('Add new config', () => {
        cy.get('[data-cy=newConstantVariable]').should('be.visible')

        cy.get('[data-cy=newConfigName]').type('new')
        // cy.get('[data-cy=newConfigSelect_new]').select('string')
        cy.get('[data-cy=newConfigSelect_new]').parent().click()
        cy.get('.v-menu__content').contains('string').click()
        cy.get('[data-cy=newConfigAdd_new]').click()

        cy.get('[data-cy=newConfigParent] > div').should('have.length', 1)

        cy.get('[data-cy=newConfigName]').type('new_number')
        cy.get('[data-cy=newConfigSelect_new_number]').parent().click()

        cy.get('.menuable__content__active > .v-list > .v-list-item').within(() => {
            cy.get('.v-list-item__title').each($div => {
                if ($div.text() === 'number') {
                    $div.click()
                }
            })
        })
        // cy.get('[data-cy=newConfigNumber]').type('1')
        cy.get('[data-cy=newConfigAdd_new_number]').click()

        cy.get('[data-cy=newConfigParent] > div').should('have.length', 2)

        cy.get('[data-cy=newConfigName]').type('new_password')
        cy.get('[data-cy=newConfigSelect_new_password]').parent().click()
        cy.get('.menuable__content__active > .v-list > .v-list-item').within(() => {
            cy.get('.v-list-item__title').each($div => {
                if ($div.text() === 'password') {
                    $div.click()
                }
            })
        })
        // cy.get('[data-cy=newConfigPassword]').type('password')
        cy.get('[data-cy=newConfigAdd_new_password]').click()

        cy.get('[data-cy=newConfigParent] > div').should('have.length', 3)

        cy.get('[data-cy=newConfigName]').type('new_boolean')
        cy.get('[data-cy=newConfigSelect_new_boolean]').parent().click()
        cy.get('.menuable__content__active > .v-list > .v-list-item').within(() => {
            cy.get('.v-list-item__title').each($div => {
                if ($div.text() === 'boolean') {
                    $div.click()
                }
            })
        })
        // cy.get('[data-cy=newConfigBoolean]').parent().click()
        cy.get('[data-cy=newConfigAdd_new_boolean]').click()

        cy.get('[data-cy=newConfigParent] > div').should('have.length', 4)

        cy.get('[data-cy=newConfigName]').type('new_text')
        cy.get('[data-cy=newConfigSelect_new_text]').parent().click()
        cy.get('.menuable__content__active > .v-list > .v-list-item').within(() => {
            cy.get('.v-list-item__title').each($div => {
                if ($div.text() === 'text') {
                    $div.click()
                }
            })
        })
        // cy.get('[data-cy=newConfigText]').type('text')
        cy.get('[data-cy=newConfigAdd_new_text]').click()

        cy.get('[data-cy=newConfigParent] > div').should('have.length', 5)

        cy.get('[data-cy=newConfigName]').type('new_list')
        cy.get('[data-cy=newConfigSelect_new_list]').parent().click()
        cy.get('.menuable__content__active > .v-list > .v-list-item').within(() => {
            cy.get('.v-list-item__title').each($div => {
                if ($div.text() === 'list') {
                    $div.click()
                }
            })
        })
        // cy.get('[data-cy=newConfigList]').type('text{enter}')
        // cy.get('[data-cy=newConfigList]').type('text2{enter}')
        cy.get('[data-cy=newConfigAdd_new_list]').click()

        cy.get('[data-cy=newConfigParent] > div').should('have.length', 6)
    })
    it('Validate added values', () => {
        cy.get('[data-cy=configurationEditMode]').click()

        cy.get('[data-cy=configRow_new]').type('string')
        cy.get('[data-cy=configRow_new_number]').type('1')
        cy.get('[data-cy=configRow_new_password]').type('password')
        cy.get('[data-cy=configRow_new_boolean]').parent().click()
        cy.get('[data-cy=configRow_new_text]').type('text')
        // cy.get('.v-select__selections').children().should('have.length', 3)
    })
    it('Save configuration', () => {
        cy.get('[data-cy=saveConfigurationButton]').click()
    })
})
