import { mount } from '@vue/test-utils'

// Fixtures
import Transform from './fixtures/transform.vue'

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
