/* global DomainDependency */
import findMatchingFilterForDomain from 'tools/findMatchingFilterForDomain';


/** @function */
export default (
  dependencies: DomainDependency[],
  domain: string
): DomainDependency | undefined => dependencies.find(
  ({ 'domain': domainArray, fullDomain, regex }) => (
    findMatchingFilterForDomain(
      domainArray?.map( value => ({ value, 'format': 'domain' }) ),
      domain
    )
    || findMatchingFilterForDomain(
      fullDomain?.map( value => ({ value, 'format': 'full domain' }) ),
      domain
    )
    || findMatchingFilterForDomain(
      regex?.map( value => ({ value, 'format': 'regex' }) ),
      domain
    )
  )
);
