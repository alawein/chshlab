"""Make the existing verifier fixtures discoverable by ``unittest``."""

import unittest

from tests.verifiers import test_citations, test_numbers


class VerifierFixtureTests(unittest.TestCase):
    """Run the dependency-free verifier fixtures under the standard test loader."""


def _add_fixture_tests(module):
    for name, check in sorted(vars(module).items()):
        if not name.startswith("test_") or not callable(check):
            continue

        def test(self, check=check, name=name):
            with self.subTest(name=name):
                check()

        setattr(VerifierFixtureTests, name, test)


_add_fixture_tests(test_citations)
_add_fixture_tests(test_numbers)
