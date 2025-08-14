export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto container py-2">
        <div className="text-[0.625rem] text-center text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Overload. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
