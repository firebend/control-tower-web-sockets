#!/usr/bin/env bash
set -o errexit -o noclobber -o nounset -o pipefail

# Maps a conventional-commit subject to an npm release type.
#
# Prefixes are anchored, so prose containing "feature" or "fixes" no longer
# decides the release. Anything unrecognised falls through to patch: a subject
# that does not declare its intent should not silently widen the version.
getBuildType() {
  local subject="$1"
  local scope='(\([^)]*\))?'

  if [[ "$subject" == *"BREAKING CHANGE"* ]] ||
    [[ "$subject" =~ ^[a-z]+${scope}!: ]]; then
    echo "major"
  elif [[ "$subject" =~ ^feat${scope}: ]]; then
    echo "minor"
  else
    echo "patch"
  fi
}

PARENT_DIR="$PWD"
ROOT_DIR="."
echo "Removing Dist"
rm -rf "${ROOT_DIR:?}/dist"

COMMIT_MESSAGE="$(git log -1 --pretty=format:"%s")"
echo "Commit Message: $COMMIT_MESSAGE"

RELEASE_TYPE=${1:-$(getBuildType "$COMMIT_MESSAGE")}
echo "Release Type: $RELEASE_TYPE"

DRY_RUN=${DRY_RUN:-"False"}
echo "Dry Run: $DRY_RUN"

AFFECTED=$(node_modules/.bin/nx show projects --type=lib)
echo "Libraries to publish: $AFFECTED"

if [ "$AFFECTED" != "" ]; then
  cd "$PARENT_DIR"
  echo "Copy Environment Files"

  while IFS= read -r -d $' ' lib; do
    echo "Setting version for $lib"
    cd "$PARENT_DIR"
    cd "$ROOT_DIR/libs/${lib}"

    # Bump from what is actually on the registry, not from the checked-in
    # version. The "Release [skip-ci]" commit-back is best effort and has
    # drifted before, which makes the next bump recompute a version that is
    # already published and fails the release.
    PKG_NAME="$(node -p "require('./package.json').name")"
    PUBLISHED_VERSION="$(npm view "$PKG_NAME" version 2>/dev/null || true)"

    if [ -n "$PUBLISHED_VERSION" ]; then
      echo "Registry has $PKG_NAME@$PUBLISHED_VERSION, bumping from there"
      npm version "$PUBLISHED_VERSION" --allow-same-version --no-git-tag-version
    else
      echo "$PKG_NAME is unpublished, bumping from the checked-in version"
    fi

    npm version "$RELEASE_TYPE" -f -m "Control Tower Web Sockets $RELEASE_TYPE"
    echo "Building $lib"
    cd "$PARENT_DIR"
    npm run build "$lib" -- --production --with-deps
    wait
  done <<<"$AFFECTED "

  cd "$PARENT_DIR"
  while IFS= read -r -d $' ' lib; do
    if [ "$DRY_RUN" == "False" ]; then
      echo "Publishing $lib"
      npm publish "$ROOT_DIR/dist/libs/${lib}" --access=public --provenance
    else
      echo "Dry Run, not publishing $lib"
    fi
    wait
  done <<<"$AFFECTED "
else
  echo "No Libraries to publish"
fi
