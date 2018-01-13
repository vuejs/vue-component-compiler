import { mount } from '@vue/test-utils'

// Fixtures
import Transform from './fixtures/transform.vue'
import Functional from './fixtures/functional.vue'
import FunctionalRoot from './fixtures/functional-root.vue'

test('transfom to require', () => {
  const wrapper = mount(Transform)
  const data = /\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*/i

  expect(wrapper.find('img').attributes().src).toEqual(expect.stringMatching(data))
  expect(wrapper.element.children[2].children[0].getAttribute('xlink:href')).toEqual(expect.stringMatching(data))
})

test('transform srcset', () => {
  const wrapper = mount(Transform)
  const images = wrapper.findAll('img')
  const data = images.at(0).attributes().src

  expect(images.at(1).attributes().srcset).toEqual(data)
  expect(images.at(2).attributes().srcset).toEqual(data + ' 2x')
  expect(images.at(3).attributes().srcset).toEqual(data + ', ' + data + ' 2x')
  expect(images.at(4).attributes().srcset).toEqual(data + ' 2x, ' + data)
  expect(images.at(5).attributes().srcset).toEqual(data + ' 2x, ' + data + ' 3x')
  expect(images.at(6).attributes().srcset).toEqual(data + ', ' + data + ' 2x, ' + data + ' 3x')
  expect(images.at(7).attributes().srcset).toEqual(data + ' 2x, ' + data + ' 3x')

  expect(wrapper.element.children[2].children[0].getAttribute('xlink:href')).toEqual(data)
})

test('functional template', () => {
  expect(Functional._compiled).toEqual(true)
  expect(Functional.functional).toEqual(true)
  expect(Functional.staticRenderFns).toBeTruthy()
  expect(Functional.render.length).toEqual(2)

  FunctionalRoot.methods = {} // Bug in vue-test-utils
  const wrapper = mount(FunctionalRoot)
  const div = wrapper.element.children[0]
  const fn = jest.fn()

  wrapper.setMethods({ fn })

  expect(wrapper.find('h2').element.style.color).toEqual('red')
  expect(wrapper.find('span').text()).toEqual('hello')

  expect(div.children[2].textContent).toEqual('Second slot')
  expect(div.children[2].nextSibling.textContent).toEqual(' hello ')

  expect(div.children[3].textContent).toEqual('Some text')
  expect(div.children[3].children[0].textContent).toEqual('text')

  wrapper.find('.clickable').trigger('click')
  expect(fn).toHaveBeenCalled()
})
