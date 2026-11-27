import { Screen } from '../components/Screen'
import { Button, Empty } from '../components/ui'
import { useLocation } from '../lib/router'
import { useUI } from '../lib/ui'

export function NotFound() {
  const { path } = useLocation()
  const setSearch = useUI((s) => s.setSearch)
  return (
    <Screen title="Not in the files" back="/" heading={null}>
      <Empty icon="folder" title="This page is not in the files">
        <p>
          Nothing lives at <code className="mono">{path}</code>. The link may be old or mistyped.
        </p>
        <div className="row-gap">
          <Button to="/" variant="primary" icon="lantern">
            Go to Desk
          </Button>
          <Button icon="search" onClick={() => setSearch(true)}>
            Search
          </Button>
        </div>
      </Empty>
    </Screen>
  )
}
